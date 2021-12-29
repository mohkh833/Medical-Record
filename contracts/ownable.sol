pragma solidity >=0.4.22 <0.7.0;
pragma experimental ABIEncoderV2;

contract ownable {
    address public owner;
    mapping(address => bool) public isAdmin;
    event ownerChanges(address indexed from, address indexed to);
    event AdminAdded(address indexed Admin_address);
    event AdminRemoved(address indexed Admin_address);

    constructor() public {
        owner = msg.sender;
        isAdmin[msg.sender] = true;
    }

    modifier onlyOwner() {
        require(
            owner == msg.sender,
            "Only owner is have the access to do action"
        );
        _;
    }

    modifier OnlyAdmin() {
        require(
            isAdmin[msg.sender] == true,
            "Only admin is have the access to do action"
        );
        _;
    }

    function setOwner(address _owner) public onlyOwner returns (bool success) {
        require(msg.sender != _owner, "Already you are owner");
        owner = _owner;
        emit ownerChanges(msg.sender, _owner);
        return true;
    }

    function addAdmin(address _address)
        public
        OnlyAdmin
        returns (bool success)
    {
        require(isAdmin[_address] != true, "Already you are admin");
        isAdmin[_address] = true;
        emit AdminAdded(_address);
        return true;
    }

    function removeAdmin(address _address)
        public
        OnlyAdmin
        returns (bool success)
    {
        require(msg.sender != owner);
        require(isAdmin[_address]);
        isAdmin[_address] = false;
        emit AdminRemoved(_address);
        return true;
    }
}
