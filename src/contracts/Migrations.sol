pragma solidity >=0.4.21 <0.6.0;

contract Migrations
{
    address public owner;
    uint public last_completed_migration;
    
    constructor() public
    {
        owner = msg.sender; // owner表示部署合约者的地址
    }
    
    modifier restricted() // 函数修改器
    {
        if (msg.sender == owner)
        {
            _;
        }
    }
    
    function setCompleted(uint completed) public restricted
    {
        last_completed_migration = completed;
    }
    function upgrade(address new_address) public restricted
    {
        Migrations upgraded = Migrations(new_address);
        upgraded.setCompleted(last_completed_migration);
    }
}
