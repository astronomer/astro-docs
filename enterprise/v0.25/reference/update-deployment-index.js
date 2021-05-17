import { track } from "analytics";
import validate from "deployments/validate";
import publishers from "publishers";
import {
  mapPropertiesToDeployment,
  updateDeploymentConfig
} from "deployments/config";
import { TrialError } from "errors";
import config from "config";
import { get, isEmpty, merge, pick } from "lodash";
import {
  UPDATE_DEPLOYMENT,
  DEPLOYMENT_UPDATED,
  DEPLOYMENT_UPDATED_STARTED
} from "constants";

/*
 * Update a deployment.
 * @param {Object} _ The result of the parent resolver.
 * @param {Object} args The graphql arguments.
 * @param {Object} ctx The graphql context.
 * @return {Deployment} The updated Deployment.
 */
export default async function updateDeployment(_, args, ctx) {
  const pub = publishers.get(UPDATE_DEPLOYMENT);
  pub.publish(DEPLOYMENT_UPDATED_STARTED, args.workspaceUuid);
  const id = args.deploymentUuid;
  // Get the deployment first.
  const deployment = await ctx.prisma.deployment.findOne({
    where: { id: args.deploymentUuid },
    include: { workspace: true }
  });

  // Block config changes if the user is in a trial
  const stripeEnabled = config.get("stripe.enabled");
  if (!deployment.workspace.stripeCustomerId && stripeEnabled) {
    throw new TrialError();
  }

  // This should be directly defined in the schema, rather than nested
  // under payload as JSON. This is only here until we can migrate the
  // schema of this mutation. The UI should also not send non-updatable
  // properties up in the payload.
  // Until we fix these, pick out the args we allow updating on.
  const updatablePayload = pick(args.payload, [
    "label",
    "description",
    "version"
  ]);

  args.config = updateDeploymentConfig(args);

  const serviceAccountAnnotations = {};

  const serviceAccountAnnotationKey = config.get(
    "deployments.serviceAccountAnnotationKey"
  );

  const originalConfig = get(deployment, "config", {});

  // Generate the service account annotations.
  if (args.cloudRole && serviceAccountAnnotationKey) {
    serviceAccountAnnotations[serviceAccountAnnotationKey] = args.cloudRole;
  }

  const deploymentConfig = merge(
    {},
    // Get current serviceAccountAnnotations
    originalConfig,
    args.config,
    // Store serviceAccount annotations only we have value in it
    !isEmpty(serviceAccountAnnotations) && { serviceAccountAnnotations }
  );

  // Munge the args together to resemble the createDeployment mutation.
  // Once we fix the updateDeployment schema to match, we can skip this.
  const mungedArgs = merge({}, updatablePayload, {
    config: deploymentConfig,
    properties: get(args, "payload.properties", {})
  });

  // Validate our args.
  await validate(ctx.prisma, deployment.workspace.id, mungedArgs, deployment);
  // Always update charts to the version configured
  const version = config.get("deployments.chart.version");
  // Create the update statement.
  const where = { id };
  const data = merge({}, updatablePayload, {
    config: mungedArgs.config,
    version,
    ...mapPropertiesToDeployment(mungedArgs.properties)
  });

  // Update the deployment in the database.
  const updatedDeployment = await ctx.prisma.deployment.update({
    where,
    data,
    include: { workspace: true }
  });

  // Run the analytics track event
  track(ctx.user.id, "Updated Deployment", {
    deploymentId: id,
    config: args.config,
    payload: args.payload
  });

  // Publish created event for the worker
  pub.publish(DEPLOYMENT_UPDATED, id);

  // Return the updated deployment object.
  return updatedDeployment;
}
