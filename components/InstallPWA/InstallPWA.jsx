// components/InstallPWA.jsx
import { useEffect, useState } from "react";


export default function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      console.log("PWA نصب آماده");
      setSupportsPWA(true);
      setPromptInstall(e);
    };

    // چک کردن اینکه آیا قبلا نصب شده
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("transitionend", handler);
  }, []);

  const onClick = (evt) => {
    evt.preventDefault();
    if (!promptInstall) {
      return;
    }
    promptInstall.prompt();
    
    promptInstall.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('کاربر PWA را نصب کرد');
        setSupportsPWA(false);
      } else {
        console.log('کاربر نصب را رد کرد');
      }
      setPromptInstall(null);
    });
  };

  // اگر قبلا نصب شده یا پشتیبانی نمی‌شود
  if (isInstalled || !supportsPWA) {
    return null;
  }

  return (
    <div className="install-popup">
      <div className="popup-content">
        <button className="close-btn" onClick={() => setSupportsPWA(false)}>
          ✕
        </button>
        <div className="popup-icon">📱</div>
        <h3>نصب اپلیکیشن</h3>
        <p>برای دسترسی سریع‌تر، اپلیکیشن را روی دستگاه خود نصب کنید</p>
        <div className="popup-buttons">
          <button 
            className="install-btn"
            onClick={onClick}
          >
            نصب
          </button>
          <button 
            className="later-btn"
            onClick={() => setSupportsPWA(false)}
          >
            بعدا
          </button>
        </div>
      </div>
    </div>
  );
}