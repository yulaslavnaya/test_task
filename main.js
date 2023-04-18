(() => {
	const lengthPart = 6;
	// Функция которая делит массив на части.
	function SplitParts(arr) {
		if (arr.length > lengthPart) {
			let chunks = [],
				parts = Math.floor(arr.length / lengthPart);
			for (let i = 0; i < arr.length; i += lengthPart) chunks.push(arr.slice(i, i + lengthPart));
			return chunks;
		} else return arr;
	}

	async function loadProducts() {
		const response = await fetch('products.json');
		const data = await response.json();
		return data;
	}

	document.addEventListener('DOMContentLoaded', function () {
		const appContainer = document.getElementById('app');

		const brandsContainer = document.getElementById('brands-container');
		const productList = document.getElementById('product-list');
		const buttonsContainer = document.getElementById('buttons-container');
		const cartCounter = document.getElementById('cart-counter');
		const cart = []; // массив для хранения добавленных товаров
		const shoppingCart = document.getElementById('button-shopping');
		shoppingCart.href = '?basket=3';

		shoppingCart.addEventListener('click', (e) => {
			e.preventDefault();
			const filteredCart = filterCart(cart);

			render(filteredCart);
		});

		let button = document.createElement('button');
		button.classList.add('btn-set');
		button.textContent = 'Применить';
		button.addEventListener('click', handleCheckboxChange);
		buttonsContainer.appendChild(button);

		function filterCart(cart) {
			const filteredCart = cart.reduce((acc, curr) => {
				const existingObj = acc.find((obj) => obj.name === curr.name);
				if (existingObj) {
					existingObj.count++;
				} else {
					curr.count = 1;
					acc.push(curr);
				}
				return acc;
			}, []);

			return filteredCart;
		}

		// загружаем JSON-файл с брендами и создаем список брендов
		fetch('brands.json')
			.then((response) => response.json())
			.then((data) => {
				const brands = data;
				brands.forEach((brand) => {
					let formCheck = document.createElement('div');
					formCheck.classList.add('form-check', 'form-set');
					const checkbox = document.createElement('input');
					checkbox.type = 'checkbox';
					checkbox.id = brand.id;
					checkbox.value = brand.title.split(' ')[1];
					checkbox.classList.add('form-check-input');
					const label = document.createElement('label');
					label.setAttribute('for', brand);
					label.classList.add('form-check-label');
					label.textContent = brand.title;
					formCheck.append(checkbox);
					formCheck.append(label);
					brandsContainer.appendChild(formCheck);
				});
			})
			.catch((error) => console.error(error));

		// загружаем JSON-файл с продуктами и создаем список продуктов
		fetch('products.json')
			.then((response) => response.json())
			.then((data) => {
				const products = data;
				products.forEach((product) => {
					const li = document.createElement('div');
					li.classList.add('product-item');
					li.textContent = product.title;
					li.dataset.brand = product.brand;
					const img = document.createElement('img');
					img.src = product.image;
					li.append(img);
					const btnBuy = document.createElement('button');
					btnBuy.classList.add('button-buy');
					btnBuy.textContent = 'В корзину';
					btnBuy.addEventListener('click', handleBuyClick);
					li.append(btnBuy);
					productList.appendChild(li);
				});
				const buyButtons = document.querySelectorAll('.button-buy');
				buyButtons.forEach((button) => {
					button.addEventListener('click', handleBuyClick);
				});
			})
			.catch((error) => console.error(error));

		// обработчик изменения состояния checkbox
		function handleCheckboxChange(e) {
			const selectedBrands = [];
			const checkboxes = brandsContainer.querySelectorAll('input[type="checkbox"]');
			checkboxes.forEach((checkbox) => {
				if (checkbox.checked) {
					selectedBrands.push(checkbox.value);
				}
			});
			if (selectedBrands.length) filterProducts(selectedBrands);
		}

		// обработчик события "click" на кнопке "Купить"
		async function handleBuyClick(e) {
			const productItem = e.target.closest('.product-item');
			const productId = Number(productItem.dataset.brand);
			const product = await findProductById(productId);
			addToCart(product.title, product.regular_price.value, product.image, product.id, product.brand); // добавляем товар в корзину
		}

		// функция для поиска товара по ID
		async function findProductById(id) {
			const products = await loadProducts();
			return products.find((product) => product.brand === id);
		}

		// функция для добавления товара в корзину
		function addToCart(name, price, img, id, brand) {
			cart.push({ name, price, img, id, brand });
			updateCartCounter(); // обновляем счетчик товаров в корзине
			totalValue = totalPrice(cart);
			updateTotalCount();
		}

		// функция для удаления товара из корзины
		function delOnCart(id) {
			const index = cart.findIndex((n) => n.id === id);
			if (index !== -1) {
				cart.splice(index, 1);
			}

			updateCartCounter();
			totalValue = totalPrice(cart);
			updateTotalCount();
		}
		// функция для обновления счетчика товаров в корзине
		function updateCartCounter() {
			cartCounter.textContent = cart.length;
		}

		// функция для обновления счетчика итоговый цены
		function updateTotalCount() {
			totalCount.textContent = totalValue.toFixed(2) + ' $';
		}

		// функция фильтрации товаров по брендам
		function filterProducts(brands) {
			productList.querySelectorAll('.product-item').forEach((product) => {
				const productBrands = product.dataset.brand;
				let count = 0;
				brands.map((brand) => (brand.includes(productBrands) ? (count += 1) : (count += 0)));
				product.style.display = count ? 'block' : 'none';
			});
		}

		//функция для увеличения кол-ва товара
		async function handleAddProduct(e) {
			const productItem = e.target.closest('.card');
			const productId = Number(productItem.dataset.brand);
			const product = await findProductById(productId);
			addToCart(product.title, product.regular_price.value, product.image, product.id, product.brand); // добавляем товар в корзину
		}

		//функция для уменьшения кол-ва товара
		async function handleDelProduct(e) {
			const productItem = e.target.closest('.card');
			const productId = Number(productItem.dataset.brand);
			const product = await findProductById(productId);
			delOnCart(product.id); // del товар
		}

		//функция подсчета итоговой цены
		function totalPrice(products) {
			totalValue = 0;
			for (let i = 0; i < products.length; i++) {
				totalValue += products[i].price;
			}
			return totalValue;
		}

		//функция для отправки данных на сервер
		function sendData() {
			const name = inputName.value;
			const phone = inputPhone.value;

			const order = { name, phone, cart };

			// отправляем POST-запрос на сервер
			fetch('https://app.aaccent.su/js/confirm.php', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(order),
			})
				.then((response) => response.json())
				.then((data) => {
					if (data.result === 'ok') {
						const modal = document.createElement('div');
						modal.classList.add('modal');
						modal.innerHTML = `
				  <div class="modal__content">
					<p>Заказ успешно оформлен!</p>
					<button id="closeBtn">Закрыть</button>
				  </div>
				`;
						document.body.appendChild(modal);

						const closeBtn = modal.querySelector('#closeBtn');
						closeBtn.addEventListener('click', function () {
							location.reload();
						});
					}
				})
				.catch((error) => {
					console.error('Ошибка:', error);
				});
		}

		let totalValue = 0;
		const totalCount = document.createElement('div');
		const inputName = document.createElement('input');
		const inputPhone = document.createElement('input');
		const countItem = document.createElement('div');
		countItem.classList.add('count-item');

		function render(data) {
			appContainer.innerHTML = '';

			const itemContainer = document.createElement('div');
			itemContainer.classList.add('item-container');

			const backbutton = document.createElement('button');
			backbutton.textContent = 'Вернуться назад';
			backbutton.classList.add('btn', 'btn-info');
			backbutton.addEventListener('click', () => {
				location.reload();
			});
			itemContainer.append(backbutton);
			const headerBasket = document.createElement('h1');
			headerBasket.classList.add('menu-header');
			headerBasket.textContent = 'Корзина';
			itemContainer.append(headerBasket);
			if (data.length) {
				data.map((product) => {
					const item = document.createElement('div');
					item.classList.add('card');
					item.textContent = product.name;
					item.dataset.brand = product.brand;
					const img = document.createElement('img');
					img.src = product.img;
					item.append(img);
					const buttonDel = document.createElement('button');
					buttonDel.textContent = '-';
					buttonDel.classList.add('button-plus-del');
					buttonDel.addEventListener('click', handleDelProduct);
					item.append(buttonDel);
					item.append(countItem);
					const buttonAdd = document.createElement('button');
					buttonAdd.textContent = '+';
					buttonAdd.addEventListener('click', handleAddProduct);
					buttonAdd.classList.add('button-plus-del');
					item.append(buttonAdd);
					const cost = document.createElement('div');
					cost.classList.add('card-cost');
					cost.textContent = product.price + ' $';
					item.append(cost);
					itemContainer.append(item);
				});

				const labelName = document.createElement('label');
				labelName.classList.add('form-label');
				labelName.textContent = 'Введите имя:';
				inputName.classList.add('form-control');

				const labelPhone = document.createElement('label');
				labelPhone.classList.add('form-label');
				labelPhone.textContent = 'Введите номер телефона:';
				inputPhone.classList.add('form-control');

				itemContainer.append(labelName);
				itemContainer.append(inputName);
				itemContainer.append(labelPhone);
				itemContainer.append(inputPhone);

				const flexSubmit = document.createElement('div');
				flexSubmit.classList.add('flex-submit');

				const submitButton = document.createElement('button');
				submitButton.classList.add('btn-set');
				submitButton.textContent = 'Оформить заказ';
				submitButton.addEventListener('click', sendData);

				flexSubmit.append(submitButton);

				const totalCountContainer = document.createElement('div');
				totalCountContainer.textContent = 'Итого: ';
				totalCountContainer.append(totalCount);
				totalCountContainer.classList.add('total-count');

				totalCount.textContent = totalValue.toFixed(2) + ' $';

				flexSubmit.append(totalCountContainer);

				itemContainer.append(flexSubmit);
			} else {
				const emptyBasket = document.createElement('p');
				emptyBasket.classList.add('empty-basket');
				emptyBasket.textContent = 'В корзине пусто...';
				itemContainer.append(emptyBasket);
			}

			appContainer.append(itemContainer);
		}
	});
})();
