// BUDGET CONTROLLER
var budgetController = (function() {
	
	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};
	
	Expense.prototype.calcPercentage = function(totalIncome) {
		if (totalIncome > 0) {
			this.percentage = Math.round((this.value / totalIncome) * 100);
		} else {
			this.percentage = -1
		}
	};
	
	Expense.prototype.getPercentage = function() {
		return this.percentage;
	};
	
	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};
	
	var calculateTotal = function(type) {  // Private variable to calculate the total expenses and income
		var sum = 0;
		
		data.allItems[type].forEach(function(current) {
			sum += current.value;
		});
		data.totals[type] = sum;
	};
	
	var data = {
		allItems: {
			expense: [],
			income: []
		},
		totals: {
			expense: 0,
			income: 0
		},
		budget: 0,
		percentage: -1
	};
	
	return {
		addItem: function(type, des, val) {
			var newItem, ID;
			
			// Create new ID
			if (data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			} else {
				ID = 0;
			}			
			
			// Create new item based in 'income' or 'expense' type
			if (type === 'expense') {
				newItem = new Expense(ID, des, val);
			} else if (type === 'income') {
				newItem = new Income(ID, des, val);
			}
			
			// Push it into our data structure
			data.allItems[type].push(newItem);
			
			// Return the new element
			return newItem;
		},
		
		
		// ids = [1, 2, 4, 6, 8]
		// id = 6
		// index = 3
		deleteItem: function(type, id) {
			var ids, index;
			ids = data.allItems[type].map(function(current) { /* map function returns a brand new array. The callback function that is called for each element
																   * will always return something and this will be stored in a new array */
				return current.id;
			});
			
			index = ids.indexOf(id);  // indexOf return the index of the elements of the array (id)
			
			if (index !== -1) {
				data.allItems[type].splice(index, 1); // splice function remove elements of an array from the position "index" and remove "1" element
			}
			
		},
		
		calculateBudget: function() {
			
			// Calculate total income and expenses
			calculateTotal('income');
			calculateTotal('expense');
			
			// Calculate the budget: income - expenses
			data.budget = data.totals.income - data.totals.expense;
			
			// Calculate the percentage of income spent
			if (data.totals.income > 0) {
				data.percentage = Math.round((data.totals.expense / data.totals.income) * 100);
			} else {
				data.percentage = -1;
			}			
		},
		
		calculatePercentage: function() {			
			data.allItems.expense.forEach(function(current) {  // For each of the object in the array of expenses we call "calcPercentage" method
				current.calcPercentage(data.totals.income);
			});			
		},
		
		getPercentages: function() {			
			var allPerc = data.allItems.expense.map(function(current) {   // map function is gonna call "getPercentage" method for each element of the array
				return current.getPercentage();							  // each time a result is gonna be returned and stored in the allPerc variable	
			});
			return allPerc;  // returning the final and new array
		},
		
		getBudget: function() {
			return {
				budget: data.budget,
				totalInc: data.totals.income,
				totalExp: data.totals.expense,
				percentage: data.percentage
			};
		},
		
		testing: function() {
			console.log(data);
		}
	}	

})();




// UI CONTROLLER
var UIController = (function() {
	
	var DOMstrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expenseContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expensesLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		percentageItem: '.item__percentage',
		container: '.container',
		expensesPercLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
	};
	
	var formatNumber = function(num, type) {
			var numSplit, int, dec, sign;
			/*
			* + or - before the number
			* exactly decimal points
			* comma separating the thousands
			*/
			num = Math.abs(num);
			num = num.toFixed(2); // convert the number to a string of a number with two decimals(2 -> "2.00")
			
			numSplit = num.split('.'); 
			int = numSplit[0];
			if (int.length > 3) {
				int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); // putting the comma at the thousands place(3,000)
			}
			
			dec = numSplit[1];
			
			return (type === 'expense' ? '-' : '+') + ' ' + int + '.' + dec;			
		};
	
	var nodeListForEach = function(list, callback) { // this function accepts the list and a callback function as parameters
			for (var i = 0; i < list.length; i++) {
				callback(list[i], i);					// calling, on each iteration, the callback function that we defined when invoking the "nodeListForEach" function
			}
		};
	
	return {
		getinput: function() {	// Public method to returns the values entered
			return {			// Returning an object is the way to return the three inputs at the same time
				type: document.querySelector(DOMstrings.inputType).value, // Will be either "income" or "expense"
				description: document.querySelector(DOMstrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value) // parseFloat function will convert a string to a number
			};			
		},
		
		addListItem: function(obj, type) {
			var html, newHtml, element;
			
			// Create HTML string with placehoder text
			if (type === 'income') {
				element = DOMstrings.incomeContainer;
				
				html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';				
			
			} else if (type === 'expense') {
				element = DOMstrings.expenseContainer;
				
				html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}			
						
			// Replace the placeholder text with some actual data
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
			
			// Insert the HTML into the DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml); // This method inserts the new html as the last cjhild inside the ccontainer			
		},
		
		deleteListItem: function(selectorID) {				// Removing the element from the list (DOM manipulation)
			var el = document.getElementById(selectorID);
			el.parentNode.removeChild(el);
		},
		
		clearField: function() {
			var fields, fieldsArr;
			
			fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue); // This method returns a LIST, which has to be converted to an array using SLICE method
			
			fieldsArr = Array.prototype.slice.call(fields); // This is the way to convert a LIST into an ARRAY, using the prototype of the Array Constructor Object
			
			fieldsArr.forEach(function(current, index, array) { // forEach method uses an anonimous function(callback function) that receives upto three elements: current value, its index number, and the entire array
				current.value = "";				
			});
			
			fieldsArr[0].focus(); // Focus back to the description field
		},
		
		displayBudget: function(obj) {
			var type;
			obj.budget > 0 ? type = 'income' : type = 'expense';
			
			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'income');
			document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'expense');
									
			if (obj.percentage > 0) {
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
			} else {
				document.querySelector(DOMstrings.percentageLabel).textContent = '---';
			}
		},
		
		displayPercentages: function(percentages) {
			
			var fields = document.querySelectorAll(DOMstrings.expensesPercLabel); // this returns a list of HTML elements(Ex:<div class="item__percentage">21%</div>), which is call Node List
			
			nodeListForEach(fields, function(current, index) { // invoking "nodeListForEach" function and passing "fields" and a callback function as arguments				
				if (percentages[index] > 0) {
					current.textContent = percentages[index] + '%';
				} else {
					current.textContent = '---';
				}				
			});			
		},
		
		displayMonth: function() {
			var now, months, month, year;
			
			now = new Date();
			
			months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
			month = now.getMonth();
			
			year = now.getFullYear();
			document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
		},
		
		changedType: function() {
			
			var fields = document.querySelectorAll(   // This return a Node List
				DOMstrings.inputType + ',' + 
				DOMstrings.inputDescription + ',' +
				DOMstrings.inputValue
			);
			
			nodeListForEach(fields, function(current) {  // callback function that handles the color change of the elements
				current.classList.toggle('red-focus');
			});
			
			document.querySelector(DOMstrings.inputBtn).classList.toggle('red'); // changing the color of the button
			
		},
						
		getDOMstrings: function() { // Exposing the DOMstrings variable to the public
			return DOMstrings;
		}
	};
	
})();




// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
	
	var setupEventListeners = function() {  // Here we put all the code that we want to be executed right at the beginning when our app starts(init function)
		
		var DOM = UICtrl.getDOMstrings(); // new variable to get the DOMstrings
		
		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem) // ctrlAddItem is used as a callback function which is invoked when the btn is clicked
	
		document.addEventListener('keypress', function(event) {  // Event listener to handle ENTER key press
			if (event.keyCode === 13 || event.which === 13) {
				ctrlAddItem();  // ctrlAddItem function is called when ENTER is hitted
			}		
		});
		
		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);  // Event listener to the container to do EVENT DELEGATION
		
		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType); // Event listener for the type selector(- or +)
		
	};
	
	
	var updateBudget = function() {
		
		//1. Calculate the budget
		budgetCtrl.calculateBudget();
		
		//2. Return budget
		var budget = budgetCtrl.getBudget();
		
		//3. Display the budget in the UI
		UICtrl.displayBudget(budget);
	};
	
	var updatePercentages = function() {
		
		//1. Calculate percentages
		budgetCtrl.calculatePercentage();		
		
		//2. Read percentages form the budget controller
		var percentages = budgetCtrl.getPercentages();
		
		//3. Update the UI with the new percentages
		UICtrl.displayPercentages(percentages);
	}
	
	
	var ctrlAddItem = function() {  //This function is like the control of the application
		var input, newItem;
		
		//1. Get the field input data
		input = UICtrl.getinput();
		
		if (input.description !== "" && !isNaN(input.value) && input.value > 0) { // Making sure that there is some significant data that we can use
			
			//2. Add the item to the budget controller
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);

			//3. Add the new item to the user UI
			UICtrl.addListItem(newItem, input.type);

			//4. Clear the fields
			UICtrl.clearField();

			//5. Calculate and update budget
			updateBudget();
			
			//6. Calculate and update percentages
			updatePercentages();
			
		}	
	};
	
	var ctrlDeleteItem = function(event) {
		var itemID, splitID, type, ID;
		
		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;  // Getting to the parent's ID of the target element(<i class="ion-ios-close-outline"></i>)
		
		if (itemID) {
			
			// Spliting the ID (income-0)
			splitID = itemID.split('-'); //['income', '0']
			type = splitID[0];
			ID = parseInt(splitID[1]); // Getting the id's information and converting it to a number
			
			//1. Delete the item form the data structure
			budgetCtrl.deleteItem(type, ID);
			
			//2. Delete the item from the UI
			UICtrl.deleteListItem(itemID); // We have to pass the whole id of the target element
			
			//3. Update and show the new budget
			updateBudget();
			
			//4. Calculate and update percentages
			updatePercentages();
		}
	};
	
	return {
		init: function() {							// Making public "setupEventListeners" throught the "init" function
			console.log('Application has started');
			UICtrl.displayMonth();
			UICtrl.displayBudget({                  // Initiallizing the fields to zero, using the init function
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1
			});
			setupEventListeners();
		}
	};
	
	
})(budgetController, UIController);


controller.init(); // This is the only way to initialize the application