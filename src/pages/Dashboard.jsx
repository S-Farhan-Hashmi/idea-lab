/**
 * Dashboard Page — Main IoT monitoring overview
 * KPI cards, live charts, device health, alert panel
 */
import { motion } from 'framer-motion';
import { Thermometer, Wind, Droplets, LayoutDashboard } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useSettings } from '../contexts/SettingsContext';
import KPICard from '../components/dashboard/KPICard';
import DoorCard from '../components/dashboard/DoorCard';
import BuzzerCard from '../components/dashboard/BuzzerCard';
import HealthCard from '../components/dashboard/HealthCard';
import { FridgeTempChart, RoomTempChart, HumidityChart, DoorEventsChart } from '../components/charts/LiveCharts';
import DeviceHealthPanel from '../components/device/DeviceHealthPanel';
import AlertPanel from '../components/alerts/AlertPanel';
import LoadingScreen from '../components/layout/LoadingScreen';

function PageHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <LayoutDashboard size={18} color="var(--accent)" />
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>{title}</h1>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{subtitle}</p>
    </div>
  );
}

export default function Dashboard() {
  const { sensorData, connected, chartSeries, thresholds } = useData();
  const { settings } = useSettings();

  if (!sensorData) return <LoadingScreen />;

  const {
    fridgeTemp, roomTemp, humidity, doorStatus, doorOpenDuration,
    buzzer, fridgeStatus, overallHealth, deviceStatus, alerts,
  } = sensorData;

  return (
    <div>
      <PageHeader
        title="System Dashboard"
        subtitle={`${settings.fridgeName} • ${settings.hospitalName}`}
      />

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '20px',
        marginBottom: '24px',
      }}>
        <KPICard
          title="FRIDGE TEMPERATURE"
          value={fridgeTemp}
          unit="°C"
          status={fridgeStatus}
          icon={Thermometer}
          gaugeMin={-5}
          gaugeMax={15}
          safeMin={thresholds.fridgeTempMin}
          safeMax={thresholds.fridgeTempMax}
          subtitle={`Safe: ${thresholds.fridgeTempMin}°C – ${thresholds.fridgeTempMax}°C`}
          index={0}
        />
        <KPICard
          title="ROOM TEMPERATURE"
          value={roomTemp}
          unit="°C"
          status={roomTemp > thresholds.roomTempMax ? 'warning' : 'safe'}
          icon={Wind}
          gaugeMin={15}
          gaugeMax={45}
          subtitle="Ambient room temperature"
          index={1}
        />
        <KPICard
          title="HUMIDITY"
          value={humidity}
          unit="%"
          status={humidity > thresholds.humidityMax ? 'warning' : 'safe'}
          icon={Droplets}
          gaugeMin={0}
          gaugeMax={100}
          safeMin={30}
          safeMax={thresholds.humidityMax}
          subtitle={`Max: ${thresholds.humidityMax}%`}
          index={2}
        />
        <DoorCard
          doorStatus={doorStatus}
          doorOpenDuration={doorOpenDuration}
          timeout={thresholds.doorOpenTimeoutSec}
          index={3}
        />
        <BuzzerCard buzzerOn={buzzer} index={4} />

        {/* Health card spans 2 cols */}
        <HealthCard
          overallHealth={overallHealth}
          alerts={alerts}
          index={5}
        />
      </div>

      {/* Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))',
        gap: '20px',
        marginBottom: '24px',
      }}>
        <FridgeTempChart
          data={chartSeries.fridgeTemp}
          safeMin={thresholds.fridgeTempMin}
          safeMax={thresholds.fridgeTempMax}
        />
        <RoomTempChart data={chartSeries.roomTemp} />
        <HumidityChart data={chartSeries.humidity} />
        <DoorEventsChart data={chartSeries.doorEvents} />
      </div>

      {/* Bottom row: Device Health + Alerts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
      }}>
        <DeviceHealthPanel deviceStatus={deviceStatus} connected={connected} />
        <AlertPanel maxItems={8} />
      </div>
    </div>
  );
}
