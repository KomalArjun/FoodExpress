 let cart = [];
let paymentMethod = "";
function verifyEmail() {

    let name = document.getElementById("fullName").value.trim();

    let email = document.getElementById("email").value.trim();


    if (name === "") {

        alert("Please enter your name");

        return;
    }


    if (email === "") {

        alert("Please enter your email");

        return;
    }


    // Name show
    document.getElementById("verifiedName").innerText = name;


    // Email show
    document.getElementById("verifiedEmail").innerText = email;


    // Success message show
    document.getElementById("successMessage").style.display = "block";


    // Start Ordering hidden
    document.getElementById("startBtn").style.display = "none";
}
  
function startWebsite(){

    let name = document.getElementById("fullName").value.trim();
    let email = document.getElementById("email").value.trim();

    if(name=="" || email==""){
        alert("Please Enter Name and Email");
        return;
    }

    localStorage.setItem("name", name);
    localStorage.setItem("email", email);

    document.getElementById("welcomeUser").innerText =
        "Welcome, " + name;

    document.getElementById("loginPage").style.display="none";
    document.getElementById("website").style.display="block";
}


function addToCart(name, price) {

    let item = cart.find(x => x.name === name);

    if (item) {
        item.qty++;
    } else {
        cart.push({
            name: name,
            price: price,
            qty: 1
        });
    }

    showCart();
}

function showCart() {

    let count = 0;

    cart.forEach(function(item) {
        count += item.qty;
    });

    document.getElementById("cartCount").innerText = count;
}

function increase(index) {
    cart[index].qty++;
    showCart();
}

function decrease(index) {

    if (cart[index].qty > 1) {
        cart[index].qty--;
    } else {
        cart.splice(index, 1);
    }

    showCart();
}

function removeItem(index) {

    cart.splice(index, 1);
    showCart();
}
               function loginUser() {
         let username = prompt("Enter Username");
        let password = prompt("Enter Password");

      if (username == "" || password == "") {
        alert("Please enter Username and Password");
    } else {
        alert("Welcome " + username + "!\nLogin Successful");
    }
}


function searchFood() {

    let food = document.querySelector(".search-box input").value.toLowerCase();

    let cards = document.querySelectorAll(".food-card");

    cards.forEach(function(card) {

        let name = card.querySelector("h3").innerText.toLowerCase();

        if (food == "") {
            card.style.display = "block";
        }
        else if (name.includes(food)) {
            card.style.display = "block";
        }
        else {
            card.style.display = "none";
        }

    });
}

function googlePlay(){
    alert("FoodExpress App will be available soon on Google Play Store.");
}
function appStore(){
    alert("FoodExpress App will be available soon on Apple App Store.");
}
function facebook(){
    alert("Follow us on Facebook");
}

function instagram(){
    alert("Follow us on Instagram");
}

function twitter(){
    alert("Follow us on Twitter");
}

function youtube(){
    alert("Subscribe to our YouTube Channel");
}



function checkout() {

    if (cart.length == 0) {
        alert("Your Cart is Empty");
        return;
    }

    let name = localStorage.getItem("userName");
    let number = localStorage.getItem("userNumber");

    document.getElementById("customerName").value = name || "";
    document.getElementById("mobile").value = number || "";

    document.getElementById("address").value = "";

    // Checkout box show
    document.getElementById("checkoutBox").style.display = "block";
}


function selectPayment(method){

    let name = document.getElementById("customerName").value;
    let mobile = document.getElementById("mobile").value;
    let address = document.getElementById("address").value;

    if(name=="" || mobile=="" || address==""){
        alert("Please fill all details");
        return;
    }


// Google Pay / PhonePe / UPI
if(method === "Google Pay" ||
   method === "PhonePe" ||
   method === "UPI"){

    document.getElementById(
        "checkoutBox").style.display =
        "none";

    document.getElementById(
        "qrBox").style.display =
        "block";

    document.getElementById(
        "paymentTitle").innerText =
        "Scan QR Code using " + method;
        // Total amount
    let amount = 0;

    cart.forEach(function(item){
        amount += item.price * item.qty;
    });

    // QR Code
    document.getElementById("qrImage").src =
        "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=" +
        encodeURIComponent("FoodExpress Payment ₹" + amount);
    }

// Cash On Delivery
else if(method === "Cash On Delivery"){

    generateBill();
}

}

function paymentDone(){

    document.getElementById("qrBox").style.display =
        "none";

    generateBill();

}

function closeQR(){

    document.getElementById("qrBox").style.display =
        "none";

    document.getElementById("checkoutBox").style.display =
        "block";

}

function generateBill(){

    document.getElementById("checkoutBox").style.display =
        "none";

    document.getElementById("billBox").style.display =
        "block";


    let name=document.getElementById("customerName").value;

    let mobile=document.getElementById("mobile").value;

    let address=document.getElementById("address").value;


    document.getElementById("customerDetails")
    .innerHTML = `

    <b>Name:</b> ${name}<br>
    <b>Mobile:</b> ${mobile}<br>
    <b>Address:</b> ${address}

    `;


    let bill="";

    let total=0;


    cart.forEach(function(item){

        let itemTotal=item.price*item.qty;

        total+=itemTotal;


        bill+=`

        <tr>

        <td>${item.name}</td>

        <td>${item.qty}</td>

        <td>₹${itemTotal}</td>

        </tr>

        `;

    });


    document.getElementById("billItems").innerHTML=bill;

    document.getElementById("billTotal").innerHTML=total;

    document.getElementById("billPayment").innerHTML=paymentMethod;

}


function printBill(){

    window.print();

}


function closeBill(){

    document.getElementById("billBox").style.display =
        "none";

    cart=[];

    showCart();

}


function showProfile(){

    alert(
        "Name : " + localStorage.getItem("name") +
        "\nEmail : " + localStorage.getItem("email")
    );

}


window.onload = function(){

    let name = localStorage.getItem("name");

    if(name){

        document.getElementById("welcomeUser").innerText =
            "Welcome, " + name;

    }

};


function filterFood(category, button) {

    let cards =
        document.querySelectorAll(".food-card");


    cards.forEach(function(card) {

        let cardCategory =
            card.getAttribute("data-category");


        if (category === "all") {

            // All Menu
            card.style.display = "block";

        }

        else if (cardCategory === category) {

            // Selected category
            card.style.display = "block";

        }

        else {

            card.style.display = "none";

        }

    });

}


function registerUser(){

    let name =
        document.getElementById("regName").value;

    let number =
        document.getElementById("regNumber").value;

    let email =
        document.getElementById("regEmail").value;

    let password =
        document.getElementById("regPassword").value;


    if(name.trim() === ""){

        alert("Please enter your name");

        return;

    }


    if(number.trim() === ""){

        alert("Please enter your mobile number");

        return;

    }


    if(email.trim() === ""){

        alert("Please enter your email");

        return;

    }


    if(password.trim() === ""){

        alert("Please enter your password");

        return;

    }


    // Registration information save

    localStorage.setItem("userName", name);

    localStorage.setItem("userNumber", number);

    localStorage.setItem("userEmail", email);

    localStorage.setItem("userPassword", password);


    // Registration hide

    document.getElementById("registrationPage").style.display =
        "none";


    // Login show

    document.getElementById("loginPage").style.display =
        "block";


    // Login मध्ये Name आणि Email automatically आणणे

    document.getElementById("fullName").value =
        name;

    document.getElementById("email").value =
        email;

}


function showStartOrdering() {

    // Success message hide करा

    document.getElementById("successMessage").style.display =
        "none";


    // Start Ordering button show करा

    document.getElementById("startBtn").style.display =
        "block";

}


function showAllMenu(){

    let cards =
        document.querySelectorAll(".food-card");


    cards.forEach(function(card){

        card.style.display = "block";

    });


    document.getElementById("menu").scrollIntoView({

        behavior: "smooth"

    });

}


function orderAllOffers() {

    addToCart("Pizza Combo", 199);

    addToCart("Burger Combo", 199);

    addToCart("Chicken Biryani", 249);

    addToCart("Dessert Combo", 149);

    alert("🎉 All 4 Special Offers added to your Cart!");
}

function logoutUser() {

    // Website hide
    document.getElementById("website").style.display = "none";

    // Logout popup show
    document.getElementById("logoutBox").style.display = "flex";
}


function closeLogoutBox() {

    // Logout popup hide
    document.getElementById("logoutBox").style.display = "none";

    // Website completely hide
    document.getElementById("website").style.display = "none";

    // Login hide
    document.getElementById("loginPage").style.display = "none";

    // Registration page show
    document.getElementById("registrationPage").style.display = "flex";

    // Old user data clear
    localStorage.removeItem("userName");
    localStorage.removeItem("userNumber");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userPassword");
    localStorage.removeItem("name");
    localStorage.removeItem("email");

    // Registration fields clear
    document.getElementById("regName").value = "";
    document.getElementById("regNumber").value = "";
    document.getElementById("regEmail").value = "";
    document.getElementById("regPassword").value = "";
}

     function changeQuantity(name, price, change) {

    name = name.trim();

    let item = cart.find(function(item) {
        return item.name === name;
    });

    if (change === 1) {

        if (item) {
            item.qty++;
        } else {
            cart.push({
                name: name,
                price: price,
                qty: 1
            });
        }

    } else if (change === -1) {

        if (!item) {
            return;
        }

        if (item.qty > 1) {
            item.qty--;
        } else {
            cart = cart.filter(function(x) {
                return x.name !== name;
            });
        }
    }

    updateAllQuantities();
    showCart();
}



function updateAllQuantities() {

    document.querySelectorAll(".food-card").forEach(function(card) {

        const titleElement = card.querySelector("h3");
        const quantitySpan = card.querySelector(".quantity");

        if (!titleElement || !quantitySpan) return;

        const foodName = titleElement.innerText.trim();

        const item = cart.find(function(item) {
            return item.name === foodName;
        });

        quantitySpan.innerText = item ? item.qty : 0;
    });
}




