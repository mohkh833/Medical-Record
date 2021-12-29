pragma solidity >=0.4.22 <0.7.0;
pragma experimental ABIEncoderV2;
import "./hospital.sol";

contract Patient is Hospital {
    uint256 public pindex = 0;

    struct Records {
        string hname;
        string reason;
        string admittedOn;
        string disChargedOn;
        string ipfs;
    }

    struct patient {
        uint256 id;
        string name;
        string phone;
        string gender;
        string dob;
        string bloodgroup;
        string allergies;
        Records[] records;
        address addr;
    }
    address[] public patientList;
    mapping(address => mapping(address => bool)) isAuth;
    mapping(address => patient) patients;
    mapping(address => bool) isPatient;

    function addRecord(
        address _addr,
        string memory _hname,
        string memory _reason,
        string memory _admittedOn,
        string memory _dischargedOn,
        string memory _ipfs
    ) public {
        require(isPatient[_addr], "User not registered");
        require(isAuth[_addr][msg.sender], "no permsiion");
        patients[_addr].records.push(
            Records(_hname, _reason, _admittedOn, _dischargedOn, _ipfs)
        );
    }

    function addPatient(
        string memory _name,
        string memory _phone,
        string memory _gender,
        string memory _dob,
        string memory _bloodgroup,
        string memory _allergies
    ) public {
        require(!isPatient[msg.sender], "Already here");
        patientList.push(msg.sender);
        pindex = pindex + 1;
        isPatient[msg.sender] = true;
        isAuth[msg.sender][msg.sender] = true;
        patients[msg.sender].id = pindex;
        patients[msg.sender].name = _name;
        patients[msg.sender].phone = _phone;
        patients[msg.sender].gender = _gender;
        patients[msg.sender].dob = _dob;
        patients[msg.sender].bloodgroup = _bloodgroup;
        patients[msg.sender].allergies = _allergies;
        patients[msg.sender].addr = msg.sender;
    }

    function getPatientDetails(address _addr)
        public
        view
        returns (
            string memory _name,
            string memory _phone,
            string memory _gender,
            string memory _dob,
            string memory _bloodgroup,
            string memory _allergies
        )
    {
        require(isAuth[_addr][msg.sender]);
        require(isPatient[_addr]);
        patient memory tmp = patients[_addr];
        return (
            tmp.name,
            tmp.phone,
            tmp.gender,
            tmp.dob,
            tmp.bloodgroup,
            tmp.allergies
        );
    }

    function getPatientRecords(address _addr)
        public
        view
        returns (
            string[] memory _hname,
            string[] memory _reason,
            string[] memory _admittedOn,
            string[] memory _dischargedOn,
            string[] memory ipfs
        )
    {
        require(isAuth[_addr][msg.sender], "No permsiion");
        require(isPatient[_addr], "Not registered");
        require(patients[_addr].records.length > 0, "No records");
        string[] memory hname = new string[](patients[_addr].records.length);
        string[] memory Reason = new string[](patients[_addr].records.length);
        string[] memory AdmOn = new string[](patients[_addr].records.length);
        string[] memory disOn = new string[](patients[_addr].records.length);
        string[] memory IPFS = new string[](patients[_addr].records.length);
        for (uint256 i = 0; i < patients[_addr].records.length; i++) {
            hname[i] = patients[_addr].records[i].hname;
            Reason[i] = patients[_addr].records[i].reason;
            AdmOn[i] = patients[_addr].records[i].admittedOn;
            disOn[i] = patients[_addr].records[i].disChargedOn;
            IPFS[i] = patients[_addr].records[i].ipfs;
        }
        return (hname, Reason, AdmOn, disOn, IPFS);
    }

    function addAuth(address _addr) public returns (bool success) {
        require(!isAuth[msg.sender][_addr], "Already Authorised");
        require(msg.sender != _addr, "Cant add yourself");
        isAuth[msg.sender][_addr] = true;
        return true;
    }

    function revokeAuth(address _addr) public returns (bool success) {
        require(msg.sender != _addr);
        require(isAuth[msg.sender][_addr]);
        isAuth[msg.sender][_addr] = false;
        return true;
    }

    function addAuthFromTo(address _from, address _to)
        public
        returns (bool success)
    {
        require(!isAuth[_from][_to]);
        require(_from != _to);
        require(isAuth[_from][msg.sender]);
        require(isPatient[_from]);
        isAuth[_from][_to] = true;
        return true;
    }

    function removeAuthFromTo(address _from, address _to)
        public
        returns (bool success)
    {
        require(isAuth[_from][_to]);
        require(_from != _to);
        require(isAuth[_from][msg.sender]);
        require(isPatient[_from]);
        isAuth[_from][_to] = false;
        return true;
    }

    function getPatientCount() public view returns (uint256) {
        return pindex;
    }
}
