$(document).ready(function() {
    let recipesPerPage = getRecipesPerPage();
    let favoriteRecipes = JSON.parse(localStorage.getItem('favoriteRecipes')) || [];
    let currentPage = 1;

    const container = $('.favorites__container');
    const paginationContainer = $('.pagination');

    function getRecipesPerPage() {
        if ($(window).width() >= 1150) {
            return 9;
        } else if ($(window).width() >= 755) {
            return 8;
        } else {
            return 5;
        }
    }

    $(window).resize(function() {
        const newRecipesPerPage = getRecipesPerPage();
        if (newRecipesPerPage !== recipesPerPage) {
            recipesPerPage = newRecipesPerPage;
            currentPage = 1;
            renderRecipes(currentPage);
            renderPagination();
        }
    })

    initPage();

    function initPage() {
        renderRecipes(currentPage);
        renderPagination();
        setupEventListeners();
    }

    function setupEventListeners() {
        paginationContainer.on('click', '.page-link', function(event) {
            event.preventDefault();
            currentPage = parseInt($(this).text(), 10);
            renderRecipes(currentPage);
            renderPagination();
        });

        container.on('click', '.favorites__card', function(event) {
            if ($(event.target).closest('.favorites__btn').length === 0) {
                redirectToRecipePage($(this));
            }
        });

        container.on('click', '.favorites__btn', function(event) {
            event.preventDefault();
            event.stopPropagation();
            toggleFavoriteRecipe($(this).closest('.favorites__card'));
        });
    }

    function renderRecipes(page) {
        container.empty();
        const { startIndex, endIndex, paginatedRecipes } = getPaginatedRecipes(page);

        if (paginatedRecipes.length > 0) {
            paginatedRecipes.forEach(renderRecipeCard);
            $('.favorites__icon').addClass('active');
        } else {
            container.append('<p class="favorites__notification">There are no favorite recipes.</p>');
        }
    }

    function getPaginatedRecipes(page) {
        const startIndex = (page - 1) * recipesPerPage;
        const endIndex = startIndex + recipesPerPage;
        const paginatedRecipes = favoriteRecipes.slice(startIndex, endIndex);
        return { startIndex, endIndex, paginatedRecipes };
    }

    function renderRecipeCard(recipe) {
        const cardHtml = `
            <div class="favorites__card"
                data-title="${recipe.title}"
                data-total-time="${recipe.totalTime}" 
                data-calories="${recipe.calories}" 
                data-fats="${recipe.fats}" 
                data-proteins="${recipe.proteins}" 
                data-carbohydrates="${recipe.carbohydrates}"
                data-ingredients='${JSON.stringify(recipe.ingredients || [])}'
                data-instructions="${recipe.instructions}">
                <img src="${recipe.image.replace('312x231', '636x393')}" alt="${recipe.title}" width="100%" height="236">
                <div class="favorites__card-description">
                    <p class="favorites__card-title">${recipe.title}</p>
                    <div class="favorites__block">
                        <div class="favorites__category">
                            <p class="favorites__category-title">${recipe.cuisineType}</p>
                        </div>
                        <button class="favorites__btn">
                            <i class='bx bxs-heart favorites__icon active'></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.append(cardHtml);
    }

    function renderPagination() {
        paginationContainer.empty();
        const totalPages = Math.ceil(favoriteRecipes.length / recipesPerPage);

        if (totalPages <= 1) {
            paginationContainer.hide();
            return;
        }

        paginationContainer.show();

        if ($(window).width() < 370) {
            const pagesToShow = 3;
            let startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
            let endPage = Math.min(totalPages, currentPage + Math.floor(pagesToShow / 2));

            if (endPage - startPage + 1 < pagesToShow) {
                startPage = Math.max(1, endPage - pagesToShow + 1);
            }

            if (currentPage > 1) {
                paginationContainer.append('<li class="page-item arrow" data-direction="prev"><a class="page-link" href="#">&laquo;</a></li>');
            }

            for (let i = startPage; i <= endPage; i++) {
                const pageItem = $(`<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link" href="#">${i}</a></li>`);
                paginationContainer.append(pageItem);
            }

            if (currentPage < totalPages) {
                paginationContainer.append('<li class="page-item arrow" data-direction="next"><a class="page-link" href="#">&raquo;</a></li>');
            }
        } else {
            for (let i = 1; i <= totalPages; i++) {
                const pageItem = $(`<li class="page-item"><a class="page-link" href="#">${i}</a></li>`);
                if (i === currentPage) {
                    pageItem.addClass('active');
                }
                paginationContainer.append(pageItem);
            }
        }
    }

    function redirectToRecipePage($card) {
        const recipeData = {
            image: $card.find('img').attr('src'),
            title: $card.find('.favorites__card-title').text(),
            cuisineType: $card.find('.favorites__category-title').text(),
            totalTime: $card.data('total-time'),
            calories: $card.data('calories'),
            fats: $card.data('fats'),
            proteins: $card.data('proteins'),
            carbohydrates: $card.data('carbohydrates'),
            ingredients: $card.data('ingredients'),
            instructions: $card.data('instructions')
        };
        
        localStorage.setItem('selectedRecipe', JSON.stringify(recipeData));
        window.location.href = 'recipe.html';
    }

    function toggleFavoriteRecipe($card) {
        const recipeTitle = $card.data('title');
        const $icon = $card.find('.bxs-heart');

        $icon.removeClass('active').addClass('spin');
        favoriteRecipes = favoriteRecipes.filter(recipe => recipe.title !== recipeTitle);
        localStorage.setItem('favoriteRecipes', JSON.stringify(favoriteRecipes));

        $card.fadeOut(700, function() {
            $(this).remove();
            renderRecipes(currentPage);
            renderPagination();
        });
    }
});

$(document).ready(function() {
    $('.header__menu').click(function() {
        $('.header__menu').toggleClass('change');
    });
});