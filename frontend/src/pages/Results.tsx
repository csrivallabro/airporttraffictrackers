import ResultCard from '../components/ResultCard';
import type { EstimateResponse } from '../lib/api';

export default function Results({ data, onReset }: { data: EstimateResponse; onReset: () => void }) {
  return (
    <>
      <button onClick={onReset}>← New estimate</button>
      <h1>Your Estimate</h1>
      <ResultCard d={data} />
    </>
  );
}
