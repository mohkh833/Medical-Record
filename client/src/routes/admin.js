import {Chip,Card,Grid,Box,Paper, Typography,TextField, Button,CircularProgress,Dialog,DialogActions,DialogContent,DialogTitle} from '@material-ui/core';
import React, { Component} from 'react'
import Header from "../components/header";
import InitialiseWeb3 from '../components/web3';

class Admin extends Component {
    constructor(props){
        super(props);
    this.state={
        owner: '',
        account: '',
        OwnableInstance: null,
        HospitalInstance:null,
        addAddress: '',
        removeAddress: '',
        changeOwnerAddress: '',
        viewH: false,
        addHView: false,
        dopen: false,
        load: false,
        hospitalName: '',
        hospitalContact: '',
        hospitalAddress: '',
        error: false,
        isAdmin: false,
    }
}

    onHospitalNameChange = (e) => {
        this.setState({hospitalName:e.target.value})
    }

    
    onHospitalAddressChange = (e) => {
        this.setState({hospitalAddress:e.target.value})
    }

    onHospitalContactChange = (e) => {
        this.setState({hospitalContact:e.target.value})
    }

    onAddAddressChange = (e) => {
        this.setState({addAddress: e.target.value})
    }

    onRemoveAddressChange = (e) => {
        this.setState({removeAddress: e.target.value})
    }

    onOwnerAddressChange = (e) => {
        this.setState({changeOwnerAddress: e.target.value})
    }

    onAddAdminSubmit = async(e) => {
        e.preventDefault();
        this.setState({load:true})
        await this.state.OwnableInstance
        .methods.addAdmin(this.state.addAddress)
        .send({from: this.state.account})

        this.setState({load:false})
        window.location.reload();
        
    }

    onRemoveSubmit = async(e) => {
        e.preventDefault();
        this.setState({load:true})
        await this.state.OwnableInstance
        .methods.removeAdmin(this.state.removeAddress)
        .send({from: this.state.account})

        this.setState({load:false})
        window.location.reload();
    }

    onChangeOwnerSubmit = async(e) => {
        e.preventDefault();
        this.setState({load: true})
        await this.state.OwnableInstance
        .methods.setOwner(this.state.changeOwnerAddress)
        .send({from: this.state.account})

        this.setState({load: false})
        window.location.reload();
    }


    async componentWillMount (){
        let [accounts, instanceOwnable, instanceHospital] =await InitialiseWeb3();
        this.setState({
            account:accounts[0],
            OwnableInstance: instanceOwnable,
            HospitalInstance: instanceHospital
        })
        let own = await this.state.OwnableInstance.methods.owner().call();
        this.setState({
            owner: own
        })
        const isAdmon = await this.state.OwnableInstance.methods.isAdmin(this.state.account).call()
        this.setState({
            isAdmin: isAdmon
        })
    }

    isLoading = () => {
        if(this.state.load){
            return(
                <Box m={2}>
                    <Grid container justifyContent='center'>
                        <Grid item>
                            <CircularProgress/>
                        </Grid>
                    </Grid>
                </Box>
            )
        }
        return null;
    }

    getHospital = async () => {
        this.setState({viewH: false, addHView: false, load: true})
        await this.state.HospitalInstance
        .methods
        .getHospital(this.state.hospitalAddress)
        .call({from:this.state.account}).then((result => {
            this.setState({
                load:false,
                addHView:false,
                viewH:true,
                hospitalAddress: result.hospitalAddress,
                hospitalName: result.hospitalName,
                hospitalContact: result.hospitalContact,
                dopen: true
            })
        }))
    }

    addHospital = async () => {
        this.setState({addHView: false, load: true})
        await this.state.HospitalInstance
        .methods
        .addHospital(this.state.hospitalName,  this.state.hospitalContact, this.state.hospitalAddress)
        .send({from: this.state.account})
        this.setState({load: false})
        window.location.reload();
    }


    addHospitalView = () => {
        if(this.state.addHView){
            return (
                <box>
                    <Grid container justifyContent="center">
                            <Paper>
                                <Box p={2}>
                                    <Box p={0.3} justifyContent="center" display="flex" alignItems="center" >
                                        <Typography>
                                            Add Hospital
                                        </Typography>
                                    </Box>
                                    <Box p={0.3}>
                                        <TextField label="Hospital Name" onChange={this.onHospitalNameChange}> </TextField>
                                    </Box>
                                    <Box p={0.3}>
                                    <TextField label="Hospital Address" onChange={this.onHospitalAddressChange}> </TextField>
                                    </Box>

                                    <Box p={0.3}>
                                    <TextField label="Hospital Contact" onChange={this.onHospitalContactChange}> </TextField>
                                    </Box>
                                    <Box m={2} justifyContent="center" display="flex" alignItems="center">
                                        <button color="primary" onClick={this.addHospital} variant="contained">Add</button>
                                    </Box>
                                </Box>
                            </Paper>
                    </Grid>
                </box>
            )
        }
        return null;
    }

    viewHospital = () =>{
        if(this.state.viewH) {
        return(
            <Box>
                <Dialog open={this.state.dopen} onClose={() => {}}>
                    <DialogTitle>Hospital Data</DialogTitle>
                    <DialogContent>
                        Wallet Address: {'\t' + this.state.hospitalAddress} <br></br>
                        Name: {"\t" + this.state.hospitalName} <br></br>
                        Contact: {"\t" + this.state.hospitalContact} <br></br>
                    </DialogContent>
                    <DialogActions>
                    <Button onClick={() => this.setState({dopen: false})} variant="contained"
                    style={{backgroundColor: "red", color: "white"}}>Close</Button>
                    </DialogActions>
                </Dialog>
                <Grid container justifyContent="center" spacing={3}>
                    <Grid item >
                        <Paper>
                            <Box p={2}>
                                <Box m ={2} display="flex" alignItems="center" justifyContent="center">
                                        <Typography>view Hospital Data</Typography>
                                </Box>

                                <Grid containter justifyContent="center" spacing={3}>
                                    <Grid item>
                                        <TextField  onChange={this.onHospitalAddressChange} size="small" label="Address" variant="outlined" value={this.state.hospitalAddress}></TextField>
                                    </Grid>
                                    <Grid item>
                                        <button onClick={this.getHospital} color="primary" variant="contained"> Search</button>
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

    addRemoveAdmin = (owner, account) => {
        
        return (
        <Box mt={3}>
            <Box m={1}><Card>Contract Owner: {"\t"+owner}</Card></Box>
            <Box m={1}><Card>Contract Account: {"\t"+account}</Card></Box>
            <Grid container spacing={2} justifyContent="center">
            <Grid item>
                <Paper>
                <form onSubmit={this.onAddAdminSubmit}>
                    <Box p={3}>
                    <Typography edge="start" variant="h6">Add Admin</Typography>
                    <TextField id="addAddr" label="Enter Address" 
                    onChange={this.onAddAddressChange} 
                    value={this.state.addAddress}></TextField>
                    <Box m={2}>
                        <Button type="submit" variant="contained" color="primary">Submit</Button>
                        
                    </Box> 
                    </Box>
                </form>
                </Paper>
            </Grid>
            <Grid item>
            <Paper>
                <form onSubmit={this.onRemoveSubmit}>
                    <Box p={3}>
                    <Typography edge="start" variant="h6">Remove Admin</Typography>
                    <TextField id="remAddr" label="Enter Address" onChange={this.onRemoveAddressChange} value={this.state.removeAddress}></TextField>
                    <Box m={2}>
                        <Button type="submit" variant="contained" color="primary">Submit</Button>
                    </Box>
                    </Box>
                </form>
                </Paper>
            </Grid>  
            <Grid item>
                <Paper>
                <form onSubmit={this.onChangeOwnerSubmit}>
                    <Box p={3}>
                    <Typography edge="start" variant="h6">Change Owner</Typography>
                    <TextField id="ownAddr" label="Enter Address" onChange={this.onOwnerAddressChange} value={this.state.changeOwnerAddress}></TextField>
                    <Box m={2}>
                        <Button type="submit" variant="contained" color="primary">Submit</Button>
                    </Box>
                    </Box>
                </form>
                </Paper>
            </Grid>
            </Grid>
            <Box m={1}>
            <Grid container justifyContent="center" spacing={3}>
                <Grid item>
                    <Chip label="Add Hospital" style={{backgroundColor:"green"}} onClick={()=>{
                        this.setState({viewH:false,addHView:true,load:false});
                    }}></Chip>
                </Grid>
                <Grid item>
                    <Chip label="View Hospital" style={{backgroundColor:"red"}} onClick={()=>{
                        this.setState({addHView:false,viewH:true,load:false});
                    }}></Chip>
                </Grid>
            </Grid>
            </Box>
        </Box>
        )
    }
    

    render() { 
        return <div>
            <Header/>
            {this.isLoading()}
            {this.addRemoveAdmin(this.state.owner,this.state.account)}
            {this.addHospitalView()}
            {this.viewHospital()}
        </div>;
    }
}
 
export default Admin;