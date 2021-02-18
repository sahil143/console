import * as React from 'react';
import { ShallowWrapper, shallow } from 'enzyme';
import { Table } from '@patternfly/react-table';
import { Alert } from '@patternfly/react-core';
import ResultsList, { ResultsListProps } from '../ResultsList';
import { runStatus } from '../../../../utils/pipeline-augment';
import { taskRunWithResults } from '../../../taskruns/__tests__/taskrun-test-data';

jest.mock('react-i18next', () => {
  const reactI18next = require.requireActual('react-i18next');
  return {
    ...reactI18next,
    useTranslation: () => ({ t: (key) => key }),
  };
});

describe('ResultsList', () => {
  let resultsListWrapper: ShallowWrapper<ResultsListProps>;
  let resultsListProps: ResultsListProps;

  beforeEach(() => {
    resultsListProps = {
      status: runStatus.Succeeded,
      resourceName: 'Task Run',
      results: taskRunWithResults.status.taskResults,
    };
    resultsListWrapper = shallow(<ResultsList {...resultsListProps} />);
  });

  it('Should render Results Table', () => {
    expect(resultsListWrapper.find(Table).exists()).toBe(true);
    expect(resultsListWrapper.find(Alert).exists()).toBe(false);
  });
  it('Should render an Alert instead', () => {
    resultsListProps = {
      status: runStatus.Failed,
      resourceName: 'Task Run',
      results: taskRunWithResults.status.taskResults,
    };
    resultsListWrapper = shallow(<ResultsList {...resultsListProps} />);
    expect(resultsListWrapper.find(Table).exists()).toBe(false);
    expect(resultsListWrapper.find(Alert).exists()).toBe(true);
  });
});
