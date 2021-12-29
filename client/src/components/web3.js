import Web3 from 'web3';
import Ownableabi from '../contracts/ownable.json';
import Hospitalabi from '../contracts/Hospital.json';
import Patientabi from '../contracts/Patient.json';


async function InitialiseWeb3 (){
    await window.ethereum.enable();
    const web3  = new Web3(Web3.givenProvider || "http://localhost:8545");
    const accounts = await web3.eth.getAccounts();
    const networkId = await web3.eth.net.getId();
    const deployedOwnable = Ownableabi.networks[networkId];
    const deployedHospital = Hospitalabi.networks[networkId];
    const deployedPatient = Patientabi.networks[networkId];

    const instanceOwnable = await new web3.eth.Contract(Ownableabi.abi, deployedOwnable.address);
    const instanceHospital = await new web3.eth.Contract(Hospitalabi.abi, deployedHospital.address);
    const instancePatient = await new web3.eth.Contract(Patientabi.abi, deployedPatient.address);

    return[accounts, instanceOwnable, instanceHospital, instancePatient]
}

export default InitialiseWeb3;