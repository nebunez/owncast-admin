import { Typography, Statistic, Card, Progress} from "antd";

const { Text } = Typography;

interface ProgressViewProps {
  title: string;
  value: React.ReactText;
  prefix: JSX.Element;
  color?: string;
}
const defaultProgressViewProps = {
  color: ''
};

function ProgressView({ title, value, prefix, color }: ProgressViewProps) {
  if ((typeof value) !== 'number') {
    throw new Error("ProgressView requires a value of type 'number'")
  }

  const endColor = value > 90 ? 'red' : color;
  const content = (
    <div>
    {prefix}
    <div><Text type="secondary">{title}</Text></div>
    <div><Text type="secondary">{value}%</Text></div>
    </div>
  )
  return (
    <Progress
      type="dashboard"
      percent={value as number}
      width={120}
      strokeColor={{
        '0%': color,
        '90%': endColor,
      }}
      format={() => content}
    />
  )
}
ProgressView.defaultProps = defaultProgressViewProps;

interface StatisticViewProps {
  title: string;
  value: string | number;
  prefix: JSX.Element;
  formatter?: any;
}
const defaultStatisticViewProps = {
  formatter: null
}

function StatisticView({ title, value, prefix, formatter }: StatisticViewProps) {
  return (
    <Statistic
      title={title}
      value={value}
      prefix={prefix}
      formatter={formatter}
   />
  );
}
StatisticView.defaultProps = defaultStatisticViewProps;

interface StatisticItemProps {
  title: string, 
  value: string | number,
  prefix: JSX.Element,
  color?: string,
  formatter?: any,
  progress?: boolean,
  centered?: boolean
};
const statisticItemDefaultProps = {
  color: '',
  formatter: null,
  progress: false,
  centered: false
}

function StatisticItem(props: StatisticItemProps) {
  const { progress, centered } = props;
  const View = progress ? ProgressView : StatisticView;

  const style = centered ? {display: 'flex', alignItems: 'center', justifyContent: 'center'} : {};

  return (
      <Card type="inner">
        <div style={style}>
          <View {...props} />
        </div>
      </Card>
  );
}
StatisticItem.defaultProps = statisticItemDefaultProps;

export default StatisticItem;