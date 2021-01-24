import { LineChart } from 'react-chartkick'
import 'chart.js';
import format from 'date-fns/format';
import styles from '../../styles/styles.module.scss';

import { TimedValue } from '../../types';

export interface SeriesItem {
  name: string;
  color: string;
  data: TimedValue[]
}

interface ChartData {
  [index: string]: number;
}

function createGraphDataset(dataArray: TimedValue[]) {
  const dataValues: ChartData = {};
  dataArray.forEach(item => {
    const dateObject = new Date(item.time);
    const dateString = format(dateObject, 'p P');
    dataValues[dateString] = item.value;
  })
  return dataValues;
}

interface ChartProps {
  data?: TimedValue[],
  dataCollections?: SeriesItem[],
  title: string,
  color: string,
  unit: string,
}

export default function Chart({ data, title, color, unit, dataCollections }: ChartProps) {
  const renderData = [];

  if (data && data.length > 0) {
    renderData.push({
      name: title,
      color,
      data: createGraphDataset(data)
    });
  }

  dataCollections.forEach(collection => {
    renderData.push({
        name: collection.name,
        color: collection.color,
        data: createGraphDataset(collection.data)
      })
  });

  return (
    <div className={styles.lineChartContainer}>
      <LineChart
        xtitle="Time"
        ytitle={title}
        suffix={unit}
        legend="bottom"
        color={color}
        data={renderData}
        download={title}
      />
    </div>
  );
}

Chart.defaultProps = {
  data: [],
  dataCollections: []
};
