import { Text } from 'react-native';

export type Status = 'green' | 'amber' | 'red';
export function StatusDot({ status }: { status: Status }): React.JSX.Element { return <Text style={{ color: status === 'green' ? '#198754' : status === 'amber' ? '#b7791f' : '#c53030', fontSize: 22 }}>●</Text>; }
