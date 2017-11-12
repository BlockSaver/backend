exports.Savings = (function(){
    function Savings(address, name, amount){
        this.name = name;
        this.address = address;
        this.amount = amount;
    }

    Savings.prototype.getAmount = function() {
        return this.amount;
    };
})();
