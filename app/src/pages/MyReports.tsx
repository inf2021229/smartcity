import React, { useEffect, useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonNote, IonSkeletonText, IonText, IonToggle
} from '@ionic/react';
import { Preferences } from '@capacitor/preferences';
import './MyReports.css';

type Report = {
  _id: string;
  description: string;
  latitude: number;
  longitude: number;
  status?: number;
  createdAt?: string;
  userId?: string;
};

const statusInfo = (s?: number) => (
  s === 1 ? { text: 'New',         color: '#e53935' } :
  s === 2 ? { text: 'In Progress', color: '#fb8c00' } :
  s === 0 ? { text: 'Fixed',       color: '#43a047' } :
            { text: 'Unknown',     color: '#9e9e9e' }
);

const MyReports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const { value: uid } = await Preferences.get({ key: 'user_id' });
        setUserId(uid || '');

        const url = (!showAll && uid)
          ? `https://smart-city.koyeb.app/api/reports?userId=${encodeURIComponent(uid)}`
          : 'https://smart-city.koyeb.app/api/reports';

        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || 'Failed to load reports');

        const all: Report[] = Array.isArray(data) ? data : data?.reports || [];
        const sorted = all.sort((a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        setReports(sorted);
      } catch (e: any) {
        setError(e?.message || 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    })();
  }, [showAll]);


  return (
    <IonPage>
      <IonContent className="myreports-container">
        <IonText className="page-title">My Reports</IonText>
        <div className="toggle-block">
          <div className="toggle-title">Show all reports</div>
          <div className="toggle-description">Default shows only your reports.</div>
          <IonToggle
            className="reports-toggle"
            checked={showAll}
            onIonChange={e => setShowAll(e.detail.checked)}
          />
        </div>
        {loading ? (
          <IonList className="reports-list">
            {[...Array(5)].map((_, i) => (
              <IonItem key={i} lines="none" className="report-item">
                <IonLabel>
                  <h2><IonSkeletonText animated style={{ width: '60%' }} /></h2>
                  <p><IonSkeletonText animated style={{ width: '40%' }} /></p>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        ) : error ? (
          <IonText color="danger">{error}</IonText>
        ) : reports.length === 0 ? (
          <IonText>No reports found.</IonText>
        ) : (
          <IonList className="reports-list">
            {reports.map((r) => {
              const dateStr = r.createdAt ? new Date(r.createdAt).toLocaleString() : '';
              const statusClass =
                r.status === 0 ? 'status-fixed' :
                r.status === 2 ? 'status-progress' :
                r.status === 1 ? 'status-new' : 'status-unknown';
              const statusText =
                r.status === 0 ? 'Fixed' :
                r.status === 2 ? 'In Progress' :
                r.status === 1 ? 'New' : 'Unknown';

              return (
                <IonItem key={r._id} lines="none" className="report-item">
                  <IonLabel className="report-left">
                    <h2>{r.description}</h2>
                    <p>
                      {typeof r.latitude === 'number' ? r.latitude.toFixed(5) : r.latitude},{' '}
                      {typeof r.longitude === 'number' ? r.longitude.toFixed(5) : r.longitude}
                    </p>
                  </IonLabel>

                  <div className="report-right">
                    <div className="report-date">{dateStr}</div>
                    <div className={`report-status ${statusClass}`}>{statusText}</div>
                  </div>
                </IonItem>
              );
            })}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};

export default MyReports;