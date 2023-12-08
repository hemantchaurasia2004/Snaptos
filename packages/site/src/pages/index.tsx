import React from 'react';
import { useContext, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button, TextField, Modal, Typography, List } from '@mui/material';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Divider from '@mui/material/Divider';

// import Modal from '@mui/material/Modal';
// import Modal from 'react-modal';

import {
  ConnectButton,
  InstallFlaskButton,
  ReconnectButton,
  SendHelloButton,
  Card,
} from '../components';
import { defaultSnapOrigin } from '../config';
import { MetamaskActions, MetaMaskContext } from '../hooks';
import {
  connectSnap,
  getSnap,
  isLocalSnap,
  sendHello,
  sendGetAccount,
  shouldDisplayReconnectButton,
  sendCoin,
  sendFundMe,
  sendTxnHistory,
  sendGetBalance,
} from '../utils';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin-top: 7.6rem;
  margin-bottom: 7.6rem;
  ${({ theme }) => theme.mediaQueries.small} {
    padding-left: 2.4rem;
    padding-right: 2.4rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    width: auto;
  }
`;


const Heading = styled.h1`
  margin-top: 0;
  margin-bottom: 2.4rem;
  text-align: center;
`;

const Span = styled.span`
  color: ${(props) => props.theme.colors.primary?.default};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 0;
  ${({ theme }) => theme.mediaQueries.small} {
    font-size: ${({ theme }) => theme.fontSizes.text};
  }
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 64.8rem;
  width: 100%;
  height: 100%;
  margin-top: 1.5rem;
`;
const CreateAccountButton = styled(Button)`
  font-size: 1.5rem;
  border-radius: 8px;
  width: 200px;
  height: 60px;
`;
const Notice = styled.div`
  background-color: ${({ theme }) => theme.colors.background?.alternative};
  border: 1px solid ${({ theme }) => theme.colors.border?.default};
  color: ${({ theme }) => theme.colors.text?.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;

  & > * {
    margin: 0;
  }
  ${({ theme }) => theme.mediaQueries.small} {
    margin-top: 1.2rem;
    padding: 1.6rem;
  }
`;
const StyledListContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  height: 400px;
  max-height: 80vh;
  overflow: auto;
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.error?.muted};
  border: 1px solid ${({ theme }) => theme.colors.error?.default};
  color: ${({ theme }) => theme.colors.error?.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-bottom: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;
  ${({ theme }) => theme.mediaQueries.small} {
    padding: 1.6rem;
    margin-bottom: 1.2rem;
    margin-top: 1.2rem;
    max-width: 100%;
  }
`;
const HorizontalButtonContainer = styled.div`
display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
`;
const BalanceText = styled.div`
  text-align: center;
  margin-top: 10px;
  font-size: 1.2rem;
`;
const AccountInfoBox = styled.div`
border: 1px solid rgba(25, 118, 210, 0.5); 
  border-radius: 12px; 
  padding: 15px; 
  margin-bottom: 20px;
  color: black;
  font-size: 1.2rem;  
  width: 200px;      
  height: 10px;     
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); 
  background-color: rgba(25, 118, 210, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
`;
const AccountModalContent = styled(DialogContent)`
  font-size:90rem; 
  color:#1976d2;
  fontWeight: 'bold',
`;
const Index = () => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [transferAmount, setTransferAmount] = useState(0);
  const [reciever, setReciever] = useState('');
  const [password, setPassword] = useState<string>('');
  const [isPasswordSet, setIsPasswordSet] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isAccountCreated, setIsAccountCreated] = useState(false);
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState(0);

  const isMetaMaskReady = isLocalSnap(defaultSnapOrigin)
    ? state.isFlask
    : state.snapsDetected;
  const [recipientAddress, setRecipientAddress] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isNextButtonDisabled, setIsNextButtonDisabled] = useState(true);

  const openSendModal = () => {
    setIsSendModalOpen(true);
  };

  const closeSendModal = () => {
    setIsSendModalOpen(false);
  };
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const openConfirmDialog = () => {
    setIsConfirmDialogOpen(true);
  };

  const closeConfirmDialog = () => {
    setIsConfirmDialogOpen(false);
  };

  const handleRecipientChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRecipientAddress(event.target.value);
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const enteredAmount = event.target.value;
    setSendAmount(enteredAmount);
    setIsNextButtonDisabled(Number(enteredAmount) > balance);
  };

  const handleConnectClick = async () => {
    try {
      await connectSnap();
      const installedSnap = await getSnap();

      dispatch({
        type: MetamaskActions.SetInstalled,
        payload: installedSnap,
      });
    } catch (error) {
      console.error(error);
      dispatch({ type: MetamaskActions.SetError, payload: error });
    }
  };
  const [isActivityListOpen, setIsActivityListOpen] = useState(false);

  const toggleActivityList = () => {
    setIsActivityListOpen(!isActivityListOpen);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const openCreateAccountModal = () => {
    setIsCreatingAccount(true);
  };

  const closeCreateAccountModal = () => {
    setIsCreatingAccount(false);
    setInputPassword('');
  };

  const handleAccountClick = () => {
    openCreateAccountModal();
  };
  const handleCreateAccount = () => {
    setIsCreatingAccount(false);
    setIsAccountCreated(true);
    setInputPassword('');
  };

  const handleSendHelloClick = async () => {
    try {
      await sendHello();
    } catch (error) {
      console.error(error);
      dispatch({ type: MetamaskActions.SetError, payload: error });
    }
  };
  const handleSend = () => {
    closeSendModal();
    closeConfirmDialog();
    setIsSendModalOpen(true);
  };
  const handleSendGetAccount = async () => {
    try {
      const accountinfo = await sendGetAccount();
      const { address, bal } = accountinfo;
      setAddress(address);
      setBalance(bal);
      setIsAccountCreated(true);
    } catch (error) {
      console.error(error);
      dispatch({ type: MetamaskActions.SetError, payload: error });
    }
  };

  const handleCoinTransfer = async () => {
    try {
      await sendCoin(reciever, transferAmount);
    } catch (error) {
      console.error(error);
      dispatch({ type: MetamaskActions.SetError, payload: error });
    }
  };

  const handleFundMeWithFaucet = async () => {
    try {
      await sendFundMe();
      const updatedBalance = await sendGetAccount();
      setBalance(updatedBalance.bal);
    } catch (error) {
      console.error(error);
      dispatch({ type: MetamaskActions.SetError, payload: error });
    }
  };

  const handleCreateAccountClick = () => {
    if (isPasswordSet) {
      handleSendGetAccount();
      const accountAddress = console.log('password is set');
    } else {
      const newPassword = prompt('Please enter your password:');
      console.log('password is not set');
      if (newPassword) {
        setIsPasswordSet(true);
        setPassword(newPassword);
        handleSendGetAccount();
        console.log('password is set');
      }
    }
  };

  const handleGetAllTransactions = async () => {
    try {
      await sendTxnHistory();
    } catch (error) {
      console.error(error);
      dispatch({ type: MetamaskActions.SetError, payload: error });
    }
  };

  const getBalance = async () => {
    try {
      const bal = await sendGetBalance();
    } catch (error) {
      console.error(error);
      dispatch({ type: MetamaskActions.SetError, payload: error });
    }
  };

  return (
    <Container>
      <Dialog open={isSendModalOpen} onClose={closeSendModal}>
        <DialogTitle>Send Funds</DialogTitle>
        <DialogContent>
          <TextField
            label="Recipient Address"
            value={recipientAddress}
            onChange={handleRecipientChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Amount"
            type="number"
            value={sendAmount}
            onChange={handleAmountChange}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeSendModal}>Cancel</Button>
          <Button onClick={openConfirmDialog} disabled={isNextButtonDisabled}>
            Next
          </Button>
        </DialogActions>
      </Dialog>
      {isModalOpen && (
        <Dialog open={isModalOpen} onClose={closeModal}>
          <DialogTitle>List Item Details</DialogTitle>
          <DialogContent>
            {/* Content for the modal */}
            <p>Details of the selected list item...</p>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeModal} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
      <CreateAccountButton
        variant="outlined"
        onClick={handleAccountClick}
        style={{
          marginBottom: '20px',
          borderRadius: '12px',
          fontSize: '1.2rem',
          padding: '10px 20px',
          width: '200px',
          fontWeight: 'bold',
          marginTop: '10px',
        }}
      >
        Create Account
      </CreateAccountButton>
      <Dialog
        open={isCreatingAccount}
        onClose={closeCreateAccountModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle style={{ fontSize: '2rem' }}>Create Account</DialogTitle>
        <DialogContent>
          <TextField
            label="Enter Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            InputLabelProps={{
              style: { fontSize: '1.5rem' },
            }}
            inputProps={{
              style: { fontSize: '1.2rem' },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateAccount} style={{ fontSize: '1.3rem' }}>
            Create
          </Button>
          <Button
            onClick={closeCreateAccountModal}
            style={{ fontSize: '1.3rem' }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      {isAccountCreated && (
        
          <AccountInfoBox>
        <AccountModalContent>
          <Typography variant="body1">
            Account : {address ? address : 'Not available'}
          </Typography>
          </AccountModalContent>
        </AccountInfoBox>
      )}

      <HorizontalButtonContainer>
        {/* Content inside the custom Container component */}
        <Typography variant="h3" gutterBottom style={{ textAlign: 'center' }}>
          {balance} APT
        </Typography>

        <div style={{ display: 'flex' }}>
          <Button variant="contained" onClick={openSendModal}>
            SEND
          </Button>
          <Button variant="contained" onClick={handleFundMeWithFaucet}>
            FAUCET
          </Button>
          <Button variant="contained" onClick={toggleActivityList}>
            ACTIVITY
          </Button>
        </div>
      </HorizontalButtonContainer>

      <Dialog open={isConfirmDialogOpen} onClose={closeConfirmDialog} fullWidth>
        <DialogTitle>Confirm Transaction</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Recipient Address: {recipientAddress}
          </Typography>
          <Typography variant="body1">Amount: {sendAmount}</Typography>
          <Typography variant="body1">Fee: 0</Typography>

          <Typography variant="body1">
            Total Amount: {parseInt(sendAmount) + 0}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog}>Back</Button>
          <Button onClick={handleSend} color="primary">
            Send
          </Button>
        </DialogActions>
      </Dialog>

      {isActivityListOpen && (
        <StyledListContainer>
          <List
            sx={{
              // width: '100%',
              // maxWidth: '90%',
              bgcolor: 'background.paper',
              position: 'relative',
              overflow: 'auto',
              maxHeight: 300,
              '& ul': { padding: 0 },
            }}
            subheader={<li />}
          >
            {[0, 1, 2, 3, 4].map((sectionId) => (
              <li key={`section-${sectionId}`}>
                <ul>
                  {[0, 1, 2].map((item) => (
                    <ListItem button onClick={openModal}>
                      <ListItemText
                        primary={`Item ${item}`}
                        style={{ color: 'black' }}
                      />
                    </ListItem>
                  ))}
                </ul>
              </li>
            ))}
          </List>
        </StyledListContainer>
      )}
    </Container>
    // </Container>
  );
};

export default Index;
