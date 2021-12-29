import {Table,TableHead,TableContainer,TableBody,TableCell,TableRow,Chip,Card,Grid,Box,Paper, Typography,TextField, Button,CircularProgress} from '@material-ui/core';
import React, { Component} from 'react'
import Header from "../components/header";
import InitialiseWeb3 from '../components/web3';
import ipfs from '../components/ipfs'

var CryptoJS = require('crypto-js')

function encode(myString) {
    const encodedWord = CryptoJS.enc.Utf8.parse(myString);
    const encoded = CryptoJS.enc.Base64.stringify(encodedWord);
    return encoded
}

function decode(encoded) {
    const encodedWord = CryptoJS.enc.Base64.parse(encoded);
    const decoded = CryptoJS.enc.Utf8.stringify(encodedWord);
    return decoded
}


class hospital extends Component {
    constructor(props){
        super(props);
        this.state = {
            name:'',
            phone:'',
            gender:'',
            dob:'',
            bloodgroup:'',
            allergies:'',
            account:'',
            viewH:false,
            patienView:false,
            viewPatientInfo:false,
            recordView:false,
            addOtherRecordView: false,
            load:false,
            buffer:null,
            record:[],
            recordLength:0,
            hospitalName:'',
            hospitalAddress: '',
            hospitalLocation:'',
            reason:'',
            admittedOn:'',
            dischargedOn:'',
            ipfs:'',
            HospitalInstance:'',
            rState:'',
            hospitalCount:'',
            isHospital:false,
            PatientInstance:'',
            patientAddress:''
        }
    }

    onPatientAddressChange = (e) => this.setState({patientAddress: e.target.value})
    onHospitalNameChange = (e) => this.setState({hospitalName: e.target.value})
    onReasonChange = (e) => this.setState({reason: e.target.value})
    onAdmittedOnChange = (e) => this.setState({admittedOn: e.target.value})
    onDischargedOnChange = (e) => this.setState({dischargedOn: e.target.value})


    async componentDidMount(){
        let [accounts, , instanceHospital, instancePatient] = await InitialiseWeb3()
        this.setState({HospitalInstance:instanceHospital, PatientInstance: instancePatient})
        this.setState({account:accounts[0]})
        const hCount = await this.state.HospitalInstance.methods.getHospitalCount().call()
        this.setState({hospitalCount:hCount})
        for(let i = 0; i< this.state.hospitalCount; i++){
            const hAddress = await this.state.HospitalInstance.methods.hospitalList(i).call()
            if(this.state.account === hAddress){
                this.setState({isHospital: true})
                await this.getHospitalInformation()
            }
        }
    }


    getHospitalInformation = async() =>{
        this.setState({viewH:false, load: true})
        await this.state.HospitalInstance.methods.getHospital(this.state.account).call({from: this.state.account}).then(result => {
            this.setState({
                load: false,
                hospitalAddress: result.hospitalAddress,
                hospitalName: result.hospitalName,
                hospitalLocation: result.hospitalLocation
            })
        })
    }


    getPatientDetails = async () => {
        this.setState({load: true})
        await this.state.PatientInstance.methods.getPatientDetails(this.state.patientAddress).call({from: this.state.account}).then(result => {
            this.setState({name: result._name, phone: result._phone, gender: result._gender, dob: result._dob, bloodGroup: result._bloodGroup, allergy: result._allergies, patienView: true, load: false})
        })
    }


    getPatientRecords = async() => {
        this.setState({load: true})
        let result =  await this.state.PatientInstance.methods.getPatientRecords(this.state.patientAddress).call({from: this.state.account})
        this.setState({recordLength: result["_hname"].length})
        let recs = []
        for(let i =0; i< this.state.recordLength; i++){
            recs.push({
                hospitalName:result["_hname"][i],
                reason:result["_reason"][i],
                admittedOn:result["_admittedOn"][i],
                dischargedOn:result["_dischargedOn"][i],
                ipfs:result["ipfs"][i]
            })
        }
        this.setState({records: recs, load: false, recordView: true})
    }
    

    captureFile = (event) => {
        event.stopPropagation();
        event.preventDefault();
        const file = event.target.files[0];
        let reader = new window.FileReader();
        reader.readAsArrayBuffer(file);
        reader.onloadend = () => this.convertToBuffer(reader);
    }


    convertToBuffer = async(reader) => {
        const buffer = Buffer.from(reader.result);
        this.setState({buffer});
    }


    onOtherRecordSubmit = async () => {
        this.setState({load: true, addOtherRecordView: false})
        let res = await ipfs.add(this.state.buffer)
        let url="https://ipfs.io/ipfs/"+res[0].hash;
        var cypherText = encode(CryptoJS.AES.encrypt(JSON.stringify(url), 'dmr').toString());
        var decryptedtext = CryptoJS.AES.decrypt(decode(cypherText).toString(), 'dmr').toString(CryptoJS.enc.Utf8);
        this.setState({ipfs: url.toString()})
        await this.state.PatientInstance.methods.addRecord(this.state.patientAddress, this.state.hospitalName, this.state.reason, this.state.admittedOn, this.state.dischargedOn, cypherText)
        .send({from: this.state.account})
    
        this.setState({load: false})
      }


    isLoading = () => {
        if(this.state.load){
            return(
                <Box m={2}>
                    <Grid container justifyContent="center">
                        <Grid item>
                            <CircularProgress />
                        </Grid>
                    </Grid>
                </Box>
            )
        }
    }

    viewHospital = () => {
        if(this.state.viewH){
            return(
                <Box>
                    <Grid container justifyContent='center'>
                        <Grid item>
                            <Paper>
                                <Box p={5}>
                                    <Box mt ={-2} mb={2}>
                                        <Typography align="center">hospital info</Typography>
                                    </Box>
                                    <Box>
                                        Addres: {"\t" + this.state.hospitalAddress}<br></br>
                                        Name: {"\t" + this.state.hospitalName}<br></br>
                                        Location: {"\t" + this.state.hospitalLocation}<br></br>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            )
        }
    }

    viewPatientDetails = () => {
        if(this.state.patienView){
            return (
                <Box>
                    <Grid container justifyContent="center">
                        <Grid item>
                            <Paper>
                                <Box p ={7}>
                                    <Box mt={-3} mb={3}>
                                        <Typography variant = {"h5"} align="center">Patient Info</Typography>
                                    </Box>
                                    <Box m = {1}>
                                        Name: {"\t"+this.state.name}
                                    </Box>
                                    <Box m = {1}>
                                        Phone: {"\t" + this.state.phone}
                                    </Box>
                                    <Box m = {1}>
                                        Gender: {"\t" + this.state.gender}
                                    </Box>
                                    <Box m = {1}>
                                        Dob: {"\t" + this.state.dob}
                                    </Box>
                                    <Box m = {1}>
                                        BloodGroup: {"\t" + this.state.bloodgroup}
                                    </Box>
                                    <Box m = {1}>
                                        Allergies: {"\t" + this.state.allergies}
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            )
        }
        return null
    }

    viewPatientRecords = () => {
        let rows = this.state.records
        if(this.state.recordView) {
            return(
                <Box>
                    <TableContainer>
                        <Table size ={"small"}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Hospital Name</TableCell>
                                    <TableCell>Reason</TableCell>
                                    <TableCell>Admitted On</TableCell>
                                    <TableCell>Discharged On</TableCell>
                                    <TableCell>Report</TableCell>
                                </TableRow>
                            </TableHead>
                        <TableBody>
                            {rows.map((row, index) => {
                                return(
                                <TableRow key={index}>
                                <TableCell>{row["hospitalName"]}</TableCell>
                                <TableCell>{row["reason"]}</TableCell>
                                <TableCell>{row["admittedOn"]}</TableCell>
                                <TableCell>{row["dischargedOn"]}</TableCell>
                                    <TableCell><a href={"/#/embed/"+row["ipfs"]} target="_blank">View/Download Record</a></TableCell>
                                </TableRow>
                                )
                            })}
                        </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )
        }
    }


    onViewPatient = () => {
        if(this.state.viewPatientInfo){
            return(
                <Box flex="display" alignContent="Center" justifyContent="center" m={3}>
                    <Grid container justifyContent="center">
                        <Grid item>
                            <Paper>
                                <Box p={2}>
                                    <Box mt={-1} mb={1}>
                                        <Typography align="center"> Patient Info</Typography>
                                    </Box>
                                    <Grid container justifyContent="center">
                                        <Grid item>                                        
                                            <Typography>Address: {"\t"}</Typography>
                                        </Grid>
                                        <Grid item>
                                            <TextField size={"small"} onChange={this.onPatientAddressChange}></TextField>
                                        </Grid>
                                        <Grid item>
                                        <Button onClick={async () => {
                                            await this.getPatientDetails()
                                            await this.getPatientRecords()
                                            this.setState({patienView: true, recordView: true})
                                        }} variant={"contained"} color={"primary"}>Submit</Button>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            )
        }
    }


    addOtherRecords = () => {
        if(this.state.addOtherRecordView){
            return(
                <Grid container justifyContent="center">
                    <Grid item >
                        <Paper>
                            <Box m={3} alignItems="center">
                                <Box display="flex" alignItems="center" justifyContent="center">
                                    <Typography>Add Records</Typography>
                                </Box>

                                <Box>
                                    <TextField label="Patient Address" onChange={this.onPatientAddressChange}></TextField>
                                </Box>

                                <Box>
                                <TextField label="Hospital Name" onChange={this.onHospitalNameChange}></TextField>
                                </Box>

                                
                                <Box>
                                <TextField label="Visit Name" onChange={this.onReasonChange}></TextField>
                                </Box>
                                <Box><TextField type="date" label="Admitted On" onChange={this.onAdmittedOnChange} InputLabelProps={{ shrink: true }}></TextField></Box>
                                <Box><TextField type="date" label="Discharged On" onChange={this.onDischargedOnChange} InputLabelProps={{ shrink: true }}></TextField></Box>
                                <Box display="flex" alignItems="center" justifyContent="center" mt={2} mb={2}>
                                    <TextField type="file" inputProps={{accept:"application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"}} label="Report" InputLabelProps={{ shrink: true }} onChange={this.captureFile}></TextField>
                                </Box>   
                                <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                                    <Button onClick={this.onOtherRecordSubmit} variant="contained" style={{backgroundColor:"green",color:"floralwhite"}}>Submit</Button>"
                                </Box>
                                
                            </Box>

                        </Paper>
                    </Grid>
                </Grid>
            )
        }
    }

    render() {
        if(!this.state.isHospital) {
            return (
              <div>
                <h1>Invalid Address</h1>
              </div>
            )
        }
        return <div>
        <Header />
        <Box m={1}>
        <Box m={1}><Card>Current Account: {"\t"+this.state.account}</Card></Box>
        <Box m={3}>
        <Grid container justifyContent="center" spacing={3}>
            <Grid item>
            <Chip style={{backgroundColor:"fuchsia"}} label="Hospital Information" onClick={() => {
                this.setState({patienView: false, recordView: false, addOtherRecordView: false, otherPatientInfo: false, load: false, viewH: true,viewPatientInfo: false})
            }}></Chip>
            </Grid>
            <Grid item>
            <Chip style={{backgroundColor:"mediumpurple"}} label="Add Patient Record" onClick={() => {
                this.setState({patienView: false, recordView: false, addOtherRecordView: true, otherPatientInfo: false, load: false, viewH: false,viewPatientInfo: false})
            }}></Chip>
            </Grid>
            <Grid item>
            <Chip style={{backgroundColor:"mediumpurple"}} label="View Patient Record" onClick={() => {
                this.setState({patienView: false, recordView: false, addOtherRecordView: false, viewPatientInfo: true, load: false, viewH: false})
            }}></Chip>
            </Grid>
        </Grid>
        </Box>

            {this.isLoading()}
            {this.viewHospital()}
            {this.viewPatientDetails()}
            {this.viewPatientRecords()}
            {this.onViewPatient()}
            {this.addOtherRecords()}
        </Box>
        </div>;
    }
}

export default hospital;