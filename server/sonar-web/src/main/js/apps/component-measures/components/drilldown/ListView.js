/*
 * SonarQube
 * Copyright (C) 2009-2017 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
// @flow
import React from 'react';
import ComponentsList from './ComponentsList';
//import ListFooter from '../../../../components/controls/ListFooter';
//import SourceViewer from '../../../../components/SourceViewer/SourceViewer';
import { getComponentTree } from '../../../../api/components';
import { complementary } from '../../config/complementary';
import { isDiffMetric } from '../../../../helpers/measures';
import type { Component } from '../../types';
import type { Metric } from '../../../../store/metrics/actions';

type Props = {
  component: Component,
  metric: Metric,
  metrics: { [string]: Metric },
  selected: Component
};

type State = {
  components: Array<Component>
};

// TODO Pagination

export default class ListView extends React.PureComponent {
  mounted: boolean;
  props: Props;
  state: State = {
    components: []
  };

  componentDidMount() {
    this.mounted = true;
  }

  componentWillReceiveProps(nextProps: Props) {}

  componentWillUnmount() {
    this.mounted = false;
  }

  getComponentRequestParams = ({ metric }: Props, options: Object = {}) => {
    const metricKeys = [metric.key, ...(complementary[metric.key] || [])];
    let opts: Object = {
      asc: metric.direction === 1,
      ps: 100,
      metricSortFilter: 'withMeasuresOnly',
      metricSort: metric.key
    };
    if (isDiffMetric(metric.key)) {
      opts = {
        ...opts,
        s: 'metricPeriod,name',
        metricPeriodSort: 1
      };
    } else {
      opts = {
        ...opts,
        s: 'metric,name'
      };
    }
    return { metricKeys, opts };
  };

  fetchComponents(props: Props, options: Object = {}) {
    const { metricKeys, opts } = this.getComponentRequestParams(props, options);
    getComponentTree('leaves', props.component.key, metricKeys, opts).then();
  }

  render() {
    return (
      <ComponentsList
        components={components}
        metrics={metrics}
        selected={selected}
        metric={metric}
        onClick={this.handleClick.bind(this)}
      />
    );
  }
}
