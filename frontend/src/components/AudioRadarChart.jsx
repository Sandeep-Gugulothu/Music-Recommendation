import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const AudioRadarChart = ({ seedTrack, compareTrack }) => {
  if (!seedTrack || !seedTrack.audio_dna) {
    return null;
  }

  const features = [
    { key: 'danceability', label: 'Danceability' },
    { key: 'energy', label: 'Energy' },
    { key: 'valence', label: 'Valence (Mood)' },
    { key: 'acousticness', label: 'Acoustic' },
    { key: 'instrumentalness', label: 'Instrumental' },
    { key: 'liveness', label: 'Liveness' },
    { key: 'speechiness', label: 'Speechiness' },
  ];

  const labels = features.map((f) => f.label);
  const seedValues = features.map((f) => Math.round((seedTrack.audio_dna[f.key] || 0) * 100));

  const datasets = [
    {
      label: `Seed: ${seedTrack.track_name.substring(0, 18)}...`,
      data: seedValues,
      backgroundColor: 'rgba(29, 185, 84, 0.25)',
      borderColor: '#1db954',
      borderWidth: 2,
      pointBackgroundColor: '#1db954',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#1db954',
    },
  ];

  if (compareTrack && compareTrack.audio_dna) {
    const compareValues = features.map((f) => Math.round((compareTrack.audio_dna[f.key] || 0) * 100));
    datasets.push({
      label: `Rec: ${compareTrack.track_name.substring(0, 18)}...`,
      data: compareValues,
      backgroundColor: 'rgba(6, 182, 212, 0.25)',
      borderColor: '#06b6d4',
      borderWidth: 2,
      pointBackgroundColor: '#06b6d4',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#06b6d4',
    });
  }

  const data = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.08)',
        },
        pointLabels: {
          color: '#94a3b8',
          font: {
            family: "'Plus Jakarta Sans', sans-serif",
            size: 11,
            weight: '500',
          },
        },
        ticks: {
          display: false,
          min: 0,
          max: 100,
          stepSize: 25,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#e2e8f0',
          font: {
            family: "'Plus Jakarta Sans', sans-serif",
            size: 12,
          },
          boxWidth: 12,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw}%`,
        },
      },
    },
  };

  return (
    <div className="w-full h-72 sm:h-80 flex items-center justify-center p-2">
      <Radar data={data} options={options} />
    </div>
  );
};

export default AudioRadarChart;
