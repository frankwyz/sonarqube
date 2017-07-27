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
import MeasureHeader from './MeasureHeader';
import MetricNotFound from './MetricNotFound';
import type { Component, Period } from '../types';
import type { MeasureEnhanced } from '../../../components/measure/types';
import type { Metric } from '../../../store/metrics/actions';

type Props = {
  className?: string,
  component: Component,
  fetchMeasures: (Component, Array<string>) => Promise<{ measures: Array<MeasureEnhanced> }>,
  leakPeriod?: Period,
  metric: Metric
};

type State = {
  loading: boolean,
  measure: ?MeasureEnhanced,
  secondaryMeasure: ?MeasureEnhanced
};

export default class MeasureContent extends React.PureComponent {
  mounted: boolean;
  props: Props;
  state: State = {
    loading: true,
    measure: null,
    secondaryMeasure: null
  };

  componentDidMount() {
    this.mounted = true;
    this.fetchMeasure(this.props);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (
      nextProps.component.key !== this.props.component.key ||
      nextProps.metric !== this.props.metric
    ) {
      this.fetchMeasure(nextProps);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  fetchMeasure = ({ component, fetchMeasures, metric }: Props) => {
    this.setState({ loading: true });

    const metricKeys = [metric.key];
    if (metric.key === 'ncloc') {
      metricKeys.push('ncloc_language_distribution');
    } else if (metric.key === 'function_complexity') {
      metricKeys.push('function_complexity_distribution');
    } else if (metric.key === 'file_complexity') {
      metricKeys.push('file_complexity_distribution');
    }

    fetchMeasures(component, metricKeys).then(({ measures }) => {
      if (this.mounted) {
        const measure = measures.find(measure => measure.metric.key === metric.key);
        const secondaryMeasure = measures.find(measure => measure.metric.key !== metric.key);
        this.setState({ loading: false, measure, secondaryMeasure });
      }
    }, () => this.mounted && this.setState({ loading: false }));
  };

  render() {
    const { className } = this.props;
    if (this.state.loading) {
      return (
        <div className={className}>
          <i className="spinner spinner-margin" />
        </div>
      );
    }

    const { measure } = this.state;
    if (!measure) {
      return <MetricNotFound className={className} />;
    }

    return (
      <div className={className}>
        <MeasureHeader
          component={this.props.component}
          leakPeriod={this.props.leakPeriod}
          measure={measure}
          secondaryMeasure={this.state.secondaryMeasure}
        />
      </div>
    );
  }
}
