import EstimateForm from '../components/EstimateForm';

export default function Home({ onResult }: { onResult: (d: any) => void }) {
  return (
    <>
      <h1>Airport Traffic Tracker</h1>
      <p>Get a realistic door-to-gate time with traffic + security wait.</p>
      <EstimateForm onResult={onResult} />
    </>
  );
}
