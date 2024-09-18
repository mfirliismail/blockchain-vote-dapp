// pages/index.js
import { useState, useEffect } from 'react';
import { useAccount, useEnsName, useConnect, useDisconnect, useReadContract, useWriteContract, useWatchContractEvent } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Panel } from 'primereact/panel';
import { Tag } from 'primereact/tag';

// ABI dan alamat smart contract
const contractAddress = '0x6e54dc07a29c111d73a9144724c23030a705b3eb';
import abi from '../contracts/abi.json';

export default function Wagmi() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });

  const [candidates, setCandidates] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);

  const [votedEvent, setVotedEvenet]= useState({});

  useWatchContractEvent({
    address: contractAddress,
    abi,
    eventName: 'Voted',
    onLogs(logs) {
      console.log(logs, "LOGS");
      setVotedEvenet(logs);
    },
  });

  // Read contract data
  const { data: candidatesData, isLoading: candidatesLoading, isError: candidatesError } = useReadContract({
    address: contractAddress,
    abi,
    functionName: 'getAllCandidates',
    watch: true,
  });

  const { data: hasVotedData, isLoading: hasVotedLoading, isError: hasVotedError } = useReadContract({
    address: contractAddress,
    abi,
    functionName: 'hasVoted',
    args: [address],
    watch: true,
  });

  useEffect(() => {
    if (isConnected) {
      if (candidatesData) {
        const formattedData = candidatesData.map((candidate) => ({
          id: candidate.id,
          name: candidate.name,
          voteCount: parseInt(candidate.voteCount),
        }));
        setCandidates(formattedData);
      }
      if (hasVotedData !== undefined) {
        setHasVoted(hasVotedData);
      }
    }
  }, [isConnected, candidatesData, hasVotedData]);

  const { writeContract } = useWriteContract();

  return (
    <div
      className="p-d-flex p-jc-center p-ai-center"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: '2rem',
      }}
    >
      <Card
        className="p-shadow-8"
        style={{
          width: '80%',
          padding: '2rem',
          borderRadius: '1rem',
          margin: 'auto',
          marginTop: '50px',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h1 className="p-text-center text-3xl font-bold mb-4" style={{ color: '#343a40' }}>Voting DApp</h1>

        {!isConnected ? (
          <div className="p-text-center">
            <Button
              label="Connect Wallet"
              icon="pi pi-wallet"
              onClick={() => connect({ connector: injected() })}
              className="p-button-rounded p-button-success p-mb-4"
              style={{ fontSize: '1.25rem', backgroundColor: '#4CAF50', borderColor: '#4CAF50' }}
            />
          </div>
        ) : (
          <Panel header={`Connected as ${address}`} toggleable style={{ marginBottom: '2rem', backgroundColor: '#f8f9fa', border: 'none' }}>
            <Button
              label="Disconnect"
              icon="pi pi-sign-out"
              onClick={() => disconnect()}
              className="p-button-rounded p-button-danger p-mb-3"
              style={{ fontSize: '1.25rem', backgroundColor: '#d9534f', borderColor: '#d9534f' }}
            />
          </Panel>
        )}

        {isConnected && (
          <>
            <h2 className="text-2xl font-semibold mt-5 mb-3" style={{ color: '#343a40' }}>Daftar Kandidat</h2>

            <DataTable value={candidates} tableStyle={{ minWidth: '50rem', backgroundColor: '#f5f7fa' }} paginator rows={5}>
              <Column field="id" header="ID" style={{ width: '10%' }} body={(rowData) => (
                <Tag severity="info" value={rowData.id} className="p-tag-rounded" />
              )} />
              <Column field="name" header="Nama" style={{ width: '45%' }} />
              <Column field="voteCount" header="Jumlah Suara" style={{ width: '20%' }} body={(rowData) => (
                <Tag severity="success" value={rowData.voteCount} className="p-tag-rounded" />
              )} />
              <Column
                header="Aksi"
                body={(rowData) => (
                  <Button
                    label="Vote"
                    icon="pi pi-check"
                    disabled={hasVoted}
                    onClick={() =>
                      writeContract({
                        address: contractAddress,
                        abi,
                        functionName: 'vote',
                        args: [rowData.id],
                      })
                    }
                    className="p-button-rounded p-button-success"
                    style={{ fontSize: '1rem', backgroundColor: '#007bff', borderColor: '#007bff' }}
                  />
                )}
                style={{ width: '25%' }}
              />
            </DataTable>

            {hasVoted && <p className="p-text-center mt-3 text-lg" style={{ color: '#28a745' }}>Anda telah memberikan suara.</p>}
          </>
        )}
      </Card>
    </div>
  );
}
