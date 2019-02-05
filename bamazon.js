var mysql = require("mysql");
var inquiry = require("inquirer");

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'frnk_st7',
    database: 'bamazon'
});

connection.connect(function(err) {
    if (err) throw err;
    afterConnection();
});
  
function afterConnection() {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        for (i = 0; i < res.length; i++) {
            console.log(res[i].item_id + " " + res[i].product_name + ", $" + res[i].price);
        }
        inquiry
            .prompt([
                {
                    type:"input",
                    message:"Please input the ID of the item you want to buy",
                    name:"request"
                },
                {
                    type:"input",
                    message:"How many would you like?",
                    name:"amount"
                }
            ])
        .then(function(answers){
            for (i = 0; i < res.length; i++) {
                if (res[i].item_id == answers.request) {
                    var selection = res[i].product_name;
                    var stock = res[i].stock_quantity;
                    var price = res[i].price;
                    if (answers.amount > stock) {
                        console.log("Insufficient Quantity!");
                        connection.end();
                    } else {
                        var difference = stock - answers.amount;
                        var query = 'UPDATE products SET stock_quantity = ? WHERE product_name = ?'
                        connection.query(query, [difference, selection], function(error, results, fields){
                            if (error) throw error;
                            var total = price * answers.amount;
                            console.log("Thank you for your purchase! Your total is $" + total);
                        });
                        connection.end();
                    }
                }
            }
        });
    });
};