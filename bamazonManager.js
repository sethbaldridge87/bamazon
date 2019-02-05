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
        inquiry
            .prompt([
                {
                    type:"list",
                    message:"Select a command",
                    name:"command",
                    choices: ['View Products for Sale','View Low Inventory','Add to Inventory','Add New Product']
                }
            ])
        .then(function(answers){
            switch (answers.command) {
                case "View Products for Sale":
                    console.log("You chose to view products");
                    for (i = 0; i < res.length; i++) {
                        console.log(res[i].item_id + " " + res[i].product_name + ", $" + res[i].price + ", " + res[i].stock_quantity + " available");
                    }
                    connection.end();
                    break;
                case "View Low Inventory":
                    console.log("You chose to view low inventory");
                    for (i = 0; i < res.length; i++) {
                        if (res[i].stock_quantity < 5) {
                            console.log("We are low on " + res[i].product_name);
                        }
                    }
                    connection.end();
                    break;
                case "Add to Inventory":
                    console.log("You chose to add to the inventory");
                    for (i = 0; i < res.length; i++) {
                        console.log(res[i].item_id + " " + res[i].product_name + ", " + res[i].stock_quantity + " available");
                    }
                    inquiry
                        .prompt([
                            {
                                type:"input",
                                message:"Select a product ID to increase the inventory of",
                                name:"inventoryIncrease"
                            },
                            {
                                type:"input",
                                message:"How many more will be added to the inventory?",
                                name:"amountIncrease"
                            }
                        ])
                    .then(function(inventory){
                        inventory.inventoryIncrease = inventory.inventoryIncrease - 1;
                        console.log("You chose to increase the inventory of " + res[inventory.inventoryIncrease].product_name + " by " + inventory.amountIncrease);
                        var update = 'UPDATE products SET stock_quantity = ? WHERE product_name = ?';
                        var amountToIncrease = parseInt(inventory.amountIncrease);
                        var currentStock = parseInt(res[inventory.inventoryIncrease].stock_quantity);
                        var updatedAmount = amountToIncrease += currentStock;
                        connection.query(update, [updatedAmount, res[inventory.inventoryIncrease].product_name], function(error, results, fields){
                            if (error) throw error;
                            console.log("Inventory has been updated!");
                        });
                    });
                    break;
                case "Add New Product":
                    console.log("You chose to add a new product");
                    inquiry
                        .prompt([
                            {
                                type:"list",
                                message:"Select a department to add the product to:",
                                name:"newItemDepartment",
                                choices: ["electronics","kitchen","hardware","clothing","toys"]
                            },
                            {
                                type:"input",
                                message:"What will the product be called?",
                                name:"newItemName"
                            },
                            {
                                type:"input",
                                message:"How much will it be sold for?",
                                name:"newItemPrice"
                            },
                            {
                                type:"input",
                                message:"How many do we have?",
                                name:"newItemQuantity"
                            }
                        ])
                    .then(function(newItem){
                        console.log("You have added " + newItem.newItemQuantity + " " + newItem.newItemName + " to our " + newItem.newItemDepartment + " department, to be sold for $" + newItem.newItemPrice + " each.");
                        var newProduct = 'INSERT INTO bamazon.products(product_name, department_name, price, stock_quantity) VALUES (?,?,?,?)';
                        connection.query(newProduct, [newItem.newItemName, newItem.newItemDepartment, newItem.newItemPrice, newItem.newItemQuantity], function(error, results, fields){
                            if (error) throw error;
                            console.log("Inventory has been updated!");
                        });
                    });
                    break;
            }
        });
    });
};