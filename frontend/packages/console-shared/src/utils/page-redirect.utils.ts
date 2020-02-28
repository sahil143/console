import * as plugins from '@console/internal/plugins';
import { resourcePathFromModel, history } from '@console/internal/components/utils';
import { ClusterServiceVersionModel } from '@console/operator-lifecycle-manager';
import { TemplateInstanceModel } from '@console/internal/models';
import { PERSPECTIVE, PAGE_REDIRECT } from '../constants';

export const getDevPerspectiveRedirectURL = (project?: string): string =>
  project ? `/topology/ns/${project}` : '/topology';

export const getAdminPerspectiveRedirectURL = (
  page: PAGE_REDIRECT,
  project?: string,
  resName?: string,
): string =>
  ({
    [PAGE_REDIRECT.importPage]: `/k8s/cluster/projects/${project}/workloads`,
    [PAGE_REDIRECT.operand]: resourcePathFromModel(ClusterServiceVersionModel, resName, project),
    [PAGE_REDIRECT.templateInstantiate]: resourcePathFromModel(
      TemplateInstanceModel,
      resName,
      project,
    ),
  }[page]);

export const getRedirectURL = (
  perspective: PERSPECTIVE,
  page: PAGE_REDIRECT,
  project?: string,
  resName?: string,
): string =>
  ({
    [PERSPECTIVE.dev]: getDevPerspectiveRedirectURL(project),
    [PERSPECTIVE.admin]: getAdminPerspectiveRedirectURL(page, project, resName),
  }[perspective]);

export const handleRedirect = (
  perspective: string,
  page: PAGE_REDIRECT,
  project?: string,
  resName?: string,
) => {
  const perspectiveData = plugins.registry
    .getPerspectives()
    .find((item) => item.properties.id === perspective);
  const redirectURL = perspectiveData.properties.getRedirectURL(
    perspective as PERSPECTIVE,
    page,
    project,
    resName,
  );
  history.push(redirectURL);
};
