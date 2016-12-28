import _ from 'lodash';
import Immutable from 'immutable';

import { coFetchJSON } from './co-fetch';
import { connect } from './components/utils';

export const FLAGS = {
  AUTH_ENABLED: 'AUTH_ENABLED',
  CLUSTER_UPDATES: 'CLUSTER_UPDATES',
  RBAC: 'RBAC',
  RBAC_V1_ALPHA1: 'RBAC_V1_ALPHA1',
  REVOKE_TOKEN: 'REVOKE_TOKEN',
  USER_MANAGEMENT: 'USER_MANAGEMENT',
};

const DEFAULTS = {
  [FLAGS.AUTH_ENABLED]: !window.SERVER_FLAGS.authDisabled,
  [FLAGS.CLUSTER_UPDATES]: undefined,
  [FLAGS.RBAC]: undefined,
  [FLAGS.RBAC_V1_ALPHA1]: undefined,
  [FLAGS.REVOKE_TOKEN]: !!window.SERVER_FLAGS.kubectlClientID,
  [FLAGS.USER_MANAGEMENT]: undefined,
};

const SET_FLAGS = 'SET_FLAGS';
const setFlags = (dispatch, flags) => dispatch({flags, type: SET_FLAGS});

const K8S_FLAGS = {
  [FLAGS.RBAC]: '/apis/rbac.authorization.k8s.io',
  [FLAGS.RBAC_V1_ALPHA1]: '/apis/rbac.authorization.k8s.io/v1alpha1',
};

const COREOS_FLAGS = {
  [FLAGS.CLUSTER_UPDATES]: 'channeloperatorconfigs',
};

const detectK8sFlags = basePath => dispatch => coFetchJSON(basePath)
  .then(res => setFlags(dispatch, _.mapValues(K8S_FLAGS, path => res.paths.indexOf(path) >= 0)),
    () => setTimeout(() => detectK8sFlags(basePath), 5000));

const detectCoreosFlags = coreosPath => dispatch => coFetchJSON(coreosPath)
  .then(res => setFlags(dispatch, _.mapValues(COREOS_FLAGS, name => _.find(res.resources, {name}))),
    () => setTimeout(() => detectCoreosFlags(coreosPath), 5000));


export const featureActions = { detectK8sFlags, detectCoreosFlags };
export const featureReducerName = 'FLAGS';
export const featureReducers = (state, action)  => {
  if (!state) {
    return Immutable.Map(DEFAULTS);
  }

  switch (action.type) {
    case SET_FLAGS:
      _.each(action.flags, (v, k) => {
        if (!FLAGS[k]) {
          throw new Error(`unknown key for reducer ${k}`);
        }
      });
      return state.merge(action.flags);
  }

  return state;
};

export const stateToProps = (flags, state) => {
  const props = {flags: {}};
  _.each(flags, f => {
    props.flags[f] = state[featureReducerName].get(f);
  });
  return props;
};

export const connectToFlags = (...flags) => connect(state => stateToProps(flags, state));
