import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonButton,
  IonText,
  IonIcon,
  IonToast,
  IonLoading,
  IonAlert
} from '@ionic/react';
import { locationSharp } from 'ionicons/icons';
import './Welcome.css';
import { useIonRouter } from '@ionic/react';
import { Preferences } from '@capacitor/preferences';

const Welcome: React.FC = () => { 
  const [email, setEmail] = useState('');   
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; msg: string }>({ open: false, msg: '' });
  const router = useIonRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      setToast({ open: true, msg: 'Please enter email and password.' });
      return;
    }

    try {
      setBusy(true);
      const response = await fetch('https://smart-city.koyeb.app/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        const userId = data.user._id ?? data.user.id ?? '';
        const userEmail = data.user.email ?? email.trim();

        await Preferences.set({ key: 'user_id', value: String(userId) });
        await Preferences.set({ key: 'user_email', value: userEmail });
        await Preferences.set({ key: 'user', value: JSON.stringify({ _id: userId, email: userEmail }) });
      
        console.log('Saved user info:', { userId, userEmail });
      
        setToast({ open: true, msg: 'Login successful!' });
        router.push('/home', 'root');
      } else {
        setToast({ open: true, msg: data.message || 'Invalid email or password.' });
      }
    } catch (err) {
      console.error('Login error:', err);
      setToast({ open: true, msg: 'Failed to connect to server.' });
    } finally {
      setBusy(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password) {
      setToast({ open: true, msg: 'Please enter email and password.' });
      return;
    }

    try {
      setBusy(true);
      const response = await fetch('https://smart-city.koyeb.app/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setToast({ open: true, msg: 'Account created successfully! You can now log in.' });
      } else {
        setToast({ open: true, msg: data.message || 'Registration failed.' });
      }
    } catch (err) {
      console.error('Registration error:', err);
      setToast({ open: true, msg: 'Failed to connect to server.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="welcome-container">
          <IonText className="page-title">Welcome</IonText>

          <IonIcon className="icon" icon={locationSharp}></IonIcon>

          <IonText>
            <h1 className="welcome-description-title">Welcome to UrbanEye!</h1>
            <p className="welcome-description">
              Sign in to report issues, track your submissions, and help improve your city.
            </p>
          </IonText>

          <IonItem className="welcome-input">
            <IonInput
              name="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onInput={(e: any) => setEmail(e.target.value)}
            ></IonInput>
          </IonItem>

          <IonItem className="welcome-input">
            <IonInput
              name='password'
              type="password"
              placeholder="Enter your password"
              value={password}
              onInput={(e: any) => setPassword(e.target.value)}
            ></IonInput>
          </IonItem>

          <IonButton expand="block" shape="round" className="welcome-button" onClick={handleLogin}>
            <p>Login</p>
          </IonButton>

          <IonButton expand="block" shape="round" className="welcome-button" onClick={handleRegister}>
            <p>Create Account</p>
          </IonButton>
        </div>

        <IonLoading isOpen={busy} message="Please wait..." />

        <IonToast
          isOpen={toast.open}
          message={toast.msg}
          duration={2000}
          onDidDismiss={() => setToast({ open: false, msg: '' })}
        />
      </IonContent>
    </IonPage>
  );
};

export default Welcome;