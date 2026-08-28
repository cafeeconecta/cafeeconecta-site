// =========================================================
// CONFIGURAÇÕES
// =========================================================

const PIX_DISCOUNT = 0.10;

let cart = [];


// =========================================================
// ELEMENTOS DO DOM
// =========================================================

const cartItemsContainer = document.getElementById("cart-items");
const cartCountElement = document.getElementById("cart-count");

const cartSubtotalElement = document.getElementById("cart-subtotal");
const cartDiscountElement = document.getElementById("cart-discount");
const cartTotalElement = document.getElementById("cart-total");

const discountRow = document.getElementById("discount-row");

const paymentMethod = document.getElementById("payment-method");
const checkoutButton = document.getElementById("checkout-btn");

const filterButtons = document.querySelectorAll(".filter-btn");
const menuItems = document.querySelectorAll(".menu-item");
const addButtons = document.querySelectorAll(".add-btn");


// =========================================================
// FORMATAÇÃO DE MOEDA
// =========================================================

function formatCurrency(value) {
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}


// =========================================================
// FILTRO DO CARDÁPIO
// =========================================================

function filterMenu(category) {

    filterButtons.forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.category === category
        );
    });

    menuItems.forEach(item => {

        const itemCategory = item.dataset.category;

        const shouldShow =
            category === "todos" ||
            itemCategory === category;

        item.style.display = shouldShow ? "flex" : "none";
    });
}


// =========================================================
// ADICIONAR AO CARRINHO
// =========================================================

function addToCart(name, price) {

    const existingItem = cart.find(
        item => item.name === name
    );

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            name,
            price,
            quantity: 1
        });
    }

    updateCartUI();
}


// =========================================================
// ALTERAR QUANTIDADE
// =========================================================

function changeQuantity(name, amount) {

    const item = cart.find(
        product => product.name === name
    );

    if (!item) {
        return;
    }

    item.quantity += amount;

    if (item.quantity <= 0) {
        cart = cart.filter(
            product => product.name !== name
        );
    }

    updateCartUI();
}


// =========================================================
// CALCULAR SUBTOTAL
// =========================================================

function calculateSubtotal() {

    return cart.reduce(
        (total, item) => {
            return total + (item.price * item.quantity);
        },
        0
    );
}


// =========================================================
// CALCULAR DESCONTO
// =========================================================

function calculateDiscount(subtotal) {
    if (
        paymentMethod.value === "pix" ||
        paymentMethod.value === "dinheiro"
    ) {
        return subtotal * PIX_DISCOUNT;
    }

    return 0;
}


// =========================================================
// ATUALIZAR INTERFACE DO CARRINHO
// =========================================================

function updateCartUI() {

    cartItemsContainer.innerHTML = "";

    const subtotal = calculateSubtotal();
    const discount = calculateDiscount(subtotal);
    const total = subtotal - discount;

    const totalItems = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    cartCountElement.textContent = totalItems;

    cartSubtotalElement.textContent =
        formatCurrency(subtotal);

    cartDiscountElement.textContent =
        `- ${formatCurrency(discount)}`;

    cartTotalElement.textContent =
        formatCurrency(total);


    // -----------------------------------------------------
    // Carrinho vazio
    // -----------------------------------------------------

    if (cart.length === 0) {

        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <span class="empty-cart-icon">☕</span>
                <p>Seu carrinho está vazio.</p>
                <small>Adicione algo delicioso!</small>
            </div>
        `;

        return;
    }


    // -----------------------------------------------------
    // Criar itens do carrinho
    // -----------------------------------------------------

    cart.forEach(item => {

        const itemTotal =
            item.price * item.quantity;

        const itemRow =
            document.createElement("div");

        itemRow.className = "cart-item-row";

        itemRow.innerHTML = `
            <div class="cart-item-info">
                <span class="cart-item-name">
                    ${item.name}
                </span>

                <span class="cart-item-price">
                    ${formatCurrency(itemTotal)}
                </span>
            </div>

            <div class="cart-item-controls">

                <button
                    class="quantity-btn"
                    data-action="decrease"
                    data-name="${item.name}"
                    aria-label="Diminuir quantidade de ${item.name}"
                >
                    −
                </button>

                <span class="quantity">
                    ${item.quantity}
                </span>

                <button
                    class="quantity-btn"
                    data-action="increase"
                    data-name="${item.name}"
                    aria-label="Aumentar quantidade de ${item.name}"
                >
                    +
                </button>

            </div>
        `;

        cartItemsContainer.appendChild(itemRow);
    });
}


// =========================================================
// FINALIZAR PEDIDO
// =========================================================

function finalizeOrder() {

    if (cart.length === 0) {

        alert(
            "Seu carrinho está vazio!\n\n" +
            "Adicione algum produto antes de finalizar."
        );

        return;
    }

    const subtotal = calculateSubtotal();
    const discount = calculateDiscount(subtotal);
    const total = subtotal - discount;

    const method = paymentMethod.value;

    const paymentNames = {
        pix: "Pix",
        "cartao-credito": "Cartão de Crédito",
        "cartao-debito": "Cartão de Débito",
        dinheiro: "Dinheiro"
    };

    const methodText =
        paymentNames[method] || "Não informado";


    let message =
        "☕ PEDIDO ENVIADO COM SUCESSO!\n\n" +
        `Forma de pagamento: ${methodText}\n` +
        `Subtotal: ${formatCurrency(subtotal)}\n`;

    if (discount > 0) {
        message +=
            `Desconto Pix: -${formatCurrency(discount)}\n`;
    }

    message +=
        `Total: ${formatCurrency(total)}\n\n` +
        "Obrigado por comprar no Café & Conecta! ❤️";


    alert(message);

    cart = [];

    updateCartUI();
}


// =========================================================
// EVENTOS DOS FILTROS
// =========================================================

filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        filterMenu(button.dataset.category);

    });

});


// =========================================================
// EVENTOS DOS BOTÕES DE ADICIONAR
// =========================================================

addButtons.forEach(button => {

    button.addEventListener("click", () => {

        const name = button.dataset.name;
        const price = Number(button.dataset.price);

        addToCart(name, price);

    });

});


// =========================================================
// EVENTOS DO CARRINHO
// =========================================================

cartItemsContainer.addEventListener("click", event => {

    const button =
        event.target.closest(".quantity-btn");

    if (!button) {
        return;
    }

    const name = button.dataset.name;
    const action = button.dataset.action;

    if (action === "increase") {
        changeQuantity(name, 1);
    }

    if (action === "decrease") {
        changeQuantity(name, -1);
    }

});


// =========================================================
// ALTERAÇÃO DA FORMA DE PAGAMENTO
// =========================================================

paymentMethod.addEventListener("change", () => {

    const subtotal = calculateSubtotal();
    const discount = calculateDiscount(subtotal);

    cartDiscountElement.textContent =
        `- ${formatCurrency(discount)}`;

    cartTotalElement.textContent =
        formatCurrency(subtotal - discount);

    discountRow.style.display =
        discount > 0 ? "flex" : "none";
});


// =========================================================
// FINALIZAÇÃO
// =========================================================

checkoutButton.addEventListener(
    "click",
    finalizeOrder
);


// =========================================================
// INICIALIZAÇÃO
// =========================================================

discountRow.style.display = "flex";

updateCartUI();
