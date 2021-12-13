// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

contract Balances {

    /// @notice tracks user balance
    mapping(address => uint) balances; 

    /// @notice event firing for withrawal and deposits
    event PlayerDeposit(address player, uint amount);
    event PlayerWithdrawal(address player, uint amount);



    /// BANKING : DEPOSIT & WITHDRAWAL & BALANCE SECTION 

    /// @notice deposit function, adds amount to user balance
    /// @param amount to deposit 
    function deposit(uint amount) public payable {
        require(msg.value==amount, "unvalid amount");
        balances[msg.sender] += msg.value;
        emit PlayerDeposit(msg.sender, msg.value);
        
    }
    
    /// @notice withdraw function, substract amount from user balance and send the amount 
    /// @param amount to withdraw 
    function withdraw(uint amount) public {
        require(balances[msg.sender] >= amount, "not enough funds");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        emit PlayerWithdrawal(msg.sender, amount);
        
        
    }
    
    /// @notice withdraw all function, send remaining balance back to user
    function withdrawAll() public {
        require(balances[msg.sender] > 0, "no funds");
        uint amount = balances[msg.sender];
        balances[msg.sender] =0;
        payable(msg.sender).transfer(amount);
        emit PlayerWithdrawal(msg.sender, amount);
        
        
    }
    
    
    /// @param _player address
    /// @return user balance
    function getBalance(address _player) public view returns(uint) {
        return balances[_player];
    }




    



    

}