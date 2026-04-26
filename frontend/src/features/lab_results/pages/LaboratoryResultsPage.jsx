import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Tabs from '../../../components/ui/Tabs';
import { mockLabResults } from '../../../utils/mockData';
import './LaboratoryResultsPage.css';

const STATUS_VARIANT = { normal: 'success', attention: 'warning', urgent: 'danger' };

export default function LaboratoryResultsPage() {
  const all = mockLabResults;
  const attention = all.filter((r) => r.status !== 'normal');

  const renderList = (list) => (
    <div className="lab-list">
      {list.map((result) => (
        <Card key={result.id} hover className="lab-card">
          <div className="lab-card-top">
            <div className="lab-card-icon" style={{ background: result.status === 'normal' ? 'var(--color-success-bg)' : result.status === 'attention' ? 'var(--color-warning-bg)' : 'var(--color-danger-bg)' }}>
              <span className="material-symbols-rounded" style={{ color: result.status === 'normal' ? 'var(--color-success)' : result.status === 'attention' ? 'var(--color-warning)' : 'var(--color-danger)' }}>science</span>
            </div>
            <Badge variant={STATUS_VARIANT[result.status]}>{result.status}</Badge>
          </div>
          <h4 className="lab-card-name">{result.test_name}</h4>
          <p className="lab-card-summary">{result.result_summary}</p>
          <div className="lab-card-meta">
            <span><span className="material-symbols-rounded">calendar_today</span>{result.date}</span>
            <span><span className="material-symbols-rounded">local_hospital</span>{result.lab}</span>
          </div>
          <div className="lab-card-footer">
            <span className="lab-card-doctor">by {result.doctor}</span>
            <Button variant="ghost" size="sm" icon="download">Report</Button>
          </div>
        </Card>
      ))}
    </div>
  );

  const tabs = [
    { key: 'all', label: 'All Results', count: all.length, content: renderList(all) },
    { key: 'attention', label: 'Needs Attention', icon: 'warning', count: attention.length, content: renderList(attention) },
  ];

  return (
    <div className="lab-results-page">
      <PageHeader title="Laboratory Results" subtitle="Review your test results and history" />
      <Tabs tabs={tabs} />
    </div>
  );
}
