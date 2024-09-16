import '../styles/index.css';
import '../styles/style.css';
import '../images/icon.svg';
import '../images/poster.jpg';
import '../images/vegetarian.svg';
import '../images/beef.svg';
import '../images/chicken.svg';
import '../images/dessert.svg';
import '../images/lamb.svg';
import '../images/pasta.svg';
import '../images/pork.svg';
import '../images/facebook.svg';
import '../images/instagram.svg';
import '../images/gmail.svg';
import $ from 'jquery';

$(document).ready(function() {
    const apiKey = process.env.API_KEY;
    console.log(apiKey);
    let itemsPerPage = getItemsPerPage();
    let currentPage = 1;
    let totalRecipes = 0;
    let totalPages = 0;
    let query = '';
    let filters = {};

    function getItemsPerPage() {
        if ($(window).width() >= 1150) {
            return 9;
        } else if ($(window).width() >= 755) {
            return 8;
        } else {
            return 5;
        }
    }

    $(window).resize(function() {
        itemsPerPage = getItemsPerPage();
        currentPage = 1;
        loadRecipes(currentPage);
    });

    loadRecipes(currentPage);

    function loadRecipes(page) {
        const url = buildUrl(page);
        $.ajax({
            url: url,
            method: 'GET',
            success: function(response) {
                handleRecipesResponse(response);
            },
            error: function(error) {
                console.error('Error:', error);
            }
        });
    }

    function handleRecipesResponse(response) {
        const recipes = response.results || [];
        totalRecipes = Math.min(response.totalResults, 45);
        totalPages = Math.ceil(totalRecipes / itemsPerPage);
        $('.recipes__container').empty();

        if (recipes.length === 0) {
            $('.recipes__container').html('<p class="results">No recipes found. Please try a different search.</p>');
            totalRecipes = 0;
            totalPages = 0;
        } else {
            recipes.forEach(recipe => $('.recipes__container').append(generateRecipeCardHtml(recipe)));
            markFavoriteRecipes();
        }
        updatePagination();
    }

    function generateRecipeCardHtml(recipe) {
        const title = recipe.title;
        const imageUrl = recipe.image.replace('312x231', '636x393');
        const cuisineType = recipe.cuisines?.[0] || 'Unknown';
        const totalTime = recipe.readyInMinutes || 'Unknown';
        const nutrients = recipe.nutrition?.nutrients || [];
        const calories = nutrients.find(n => n.name === 'Calories')?.amount || 0;
        const fats = nutrients.find(n => n.name === 'Fat')?.amount || 0;
        const proteins = nutrients.find(n => n.name === 'Protein')?.amount || 0;
        const carbohydrates = nutrients.find(n => n.name === 'Carbohydrates')?.amount || 0;
        const instructions = recipe.analyzedInstructions?.[0]?.steps.map(step => step.step).join(' ') || 'Инструкции отсутствуют';
        const ingredients = recipe.extendedIngredients?.map(ingredient => ({
            image: ingredient.image ? `https://spoonacular.com/cdn/ingredients_100x100/${ingredient.image}` : null,
            food: ingredient.name
        })) || [];

        return `
            <div class="recipes__card"
                data-title="${title}"
                data-total-time="${totalTime}" 
                data-calories="${calories}" 
                data-fats="${fats}" 
                data-proteins="${proteins}" 
                data-carbohydrates="${carbohydrates}"
                data-ingredients='${JSON.stringify(ingredients)}'
                data-instructions="${instructions}">
                <img src="${imageUrl}" alt="${title}" width="100%" height="236">
                <div class="recipes__card-description">
                    <p class="recipes__card-title">${title}</p>
                    <div class="recipes__block">
                        <div class="recipes__category">
                            <p class="recipes__category-title">${cuisineType}</p>
                        </div>
                        <button class="recipes__btn">
                            <i class='bx bxs-heart recipes__icon'></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    function markFavoriteRecipes() {
        $('.recipes__card').each(function() {
            const card = $(this);
            if (isRecipeFavorite(card.data('title'))) {
                card.find('.bxs-heart').addClass('active');
            }
        });
    }

    function updatePagination() {
        const paginationContainer = $('.pagination').empty();
    
        if (totalPages <= 1) {
            paginationContainer.hide();
            return;
        }

        paginationContainer.show();

        const pagesToShow = 3;
        let startPage, endPage;
        
        if ($(window).width() < 370) {
            if (totalPages <= pagesToShow) {
                startPage = 1;
                endPage = totalPages;
            } else {
                startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
                endPage = Math.min(totalPages, currentPage + Math.floor(pagesToShow / 2));
                if (endPage - startPage + 1 < pagesToShow) {
                    startPage = Math.max(1, endPage - pagesToShow + 1);
                }
            }
        } else {
            startPage = 1;
            endPage = totalPages;
        }

        if ($(window).width() < 370 && currentPage > 1) {
            paginationContainer.append(`
                <li class="page-item arrow" data-direction="prev">
                    <a class="page-link" href="#">&laquo;</a>
                </li>
            `);
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationContainer.append(`
                <li class="page-item ${i === currentPage ? 'active show' : 'show'}">
                    <a class="page-link" href="#">${i}</a>
                </li>
            `);
        }

        if ($(window).width() < 370 && currentPage < totalPages) {
            paginationContainer.append(`
                <li class="page-item arrow" data-direction="next">
                    <a class="page-link" href="#">&raquo;</a>
                </li>
            `);
        }
    }

    $('.pagination').on('click', '.arrow', function(e) {
        e.preventDefault();
        const direction = $(this).data('direction');
        if (direction === 'prev' && currentPage > 1) {
            currentPage--;
        } else if (direction === 'next' && currentPage < totalPages) {
            currentPage++;
        }
        loadRecipes(currentPage);
    });

    $(document).ready(updatePagination);
    $(window).resize(updatePagination);

    $('.poster__btn').on('click', function(e) {
        e.preventDefault();
        query = $('.poster__search-input').val().trim().toLowerCase();
        currentPage = 1;
        loadRecipes(currentPage);
    });

    $('.categories__card').on('click', function() {
        const selectedCategory = $(this).find('.categories__card-name').text().trim().toLowerCase();
        if ($(this).hasClass('active')) {
            $('.categories__card').removeClass('active');
            query = '';
        } else {
            $('.categories__card').removeClass('active');
            $(this).addClass('active');
            query = selectedCategory;
        }
        currentPage = 1;
        loadRecipes(currentPage);
    });

    $('.pagination').on('click', '.page-link', function(e) {
        e.preventDefault();
        const page = parseInt($(this).text());
        if (page !== currentPage) {
            currentPage = page;
            loadRecipes(currentPage);
        }
    });

    function buildUrl(page) {
        const offset = (page - 1) * itemsPerPage;
        filters = getFilterValues();
        let url = `https://api.spoonacular.com/recipes/complexSearch?query=${query}`;
        if (filters.cuisine) url += `&cuisine=${filters.cuisine}`;
        if (filters.meal) url += `&type=${filters.meal}`;
        if (filters.intolerances) url += `&intolerances=${filters.intolerances}`;
        if (filters.maxCalories) url += `&maxCalories=${filters.maxCalories}`;
        if (filters.maxTime) url += `&maxReadyTime=${filters.maxTime}`;
        url += `&number=${itemsPerPage}&offset=${offset}&addRecipeInformation=true&instructionsRequired=true&addRecipeNutrition=true&fillIngredients=true&apiKey=${apiKey}&_=${new Date().getTime()}`;
        return url;
    }

    function getFilterValues() {
        return {
            cuisine: $('#cuisineType').val(),
            meal: $('#mealType').val(),
            intolerances: $('#intolerances').val(),
            maxCalories: $('#calories').val() || '',
            maxTime: $('#time').val() || ''
        };
    }

    $('.recipes__new-filters').on('click', function(e) {
        e.preventDefault();
        currentPage = 1;
        loadRecipes(currentPage);
    });

    $('.recipes__container').on('click', '.recipes__card', function(event) {
        if ($(event.target).closest('.recipes__btn').length) return;
        const card = $(this);
        const recipeData = {
            image: card.find('img').attr('src'),
            title: card.find('.recipes__card-title').text(),
            cuisineType: card.find('.recipes__category-title').text(),
            totalTime: card.data('total-time'),
            calories: card.data('calories'),
            fats: card.data('fats'),
            proteins: card.data('proteins'),
            carbohydrates: card.data('carbohydrates'),
            ingredients: card.data('ingredients'),
            instructions: card.data('instructions')
        };
        localStorage.setItem('selectedRecipe', JSON.stringify(recipeData));
        window.location.href = 'recipe.html';
    });

    $('.recipes__container').on('click', '.recipes__btn', function(event) {
        event.preventDefault();
        event.stopPropagation();
        const heartIcon = $(this).find('.bxs-heart');
        const card = $(this).closest('.recipes__card');
        const title = card.find('.recipes__card-title').text();
        const recipeData = {
            title: title,
            image: card.find('img').attr('src'),
            cuisine: card.find('.recipes__category-title').text(),
            totalTime: card.data('total-time'),
            calories: card.data('calories'),
            fats: card.data('fats'),
            proteins: card.data('proteins'),
            carbohydrates: card.data('carbohydrates'),
            ingredients: card.data('ingredients'),
            instructions: card.data('instructions')
        };
        if (heartIcon.hasClass('active')) {
            heartIcon.removeClass('active').addClass('spin');
            removeFavoriteRecipe(title);
        } else {
            heartIcon.addClass('active spin');
            addFavoriteRecipe(recipeData);
        }
        setTimeout(() => heartIcon.removeClass('spin'), 1000);
    });

    function getFavoriteRecipes() {
        return JSON.parse(localStorage.getItem('favoriteRecipes')) || [];
    }

    function saveFavoriteRecipes(favorites) {
        localStorage.setItem('favoriteRecipes', JSON.stringify(favorites));
    }

    function addFavoriteRecipe(recipe) {
        const favorites = getFavoriteRecipes();
        favorites.push(recipe);
        saveFavoriteRecipes(favorites);
    }

    function removeFavoriteRecipe(recipeTitle) {
        const favorites = getFavoriteRecipes().filter(recipe => recipe.title !== recipeTitle);
        saveFavoriteRecipes(favorites);
    }

    function isRecipeFavorite(recipeTitle) {
        return getFavoriteRecipes().some(recipe => recipe.title === recipeTitle);
    }

    const $recipeInput = $('.poster__search-input');
    const $recipeCloseBtn = $('.poster__close-btn');
    const $searchBtn = $('.poster__btn');

    $recipeInput.on('focus', function() {
        $recipeCloseBtn.addClass('active');
    });

    $recipeInput.on('focusout', function() {
        if ($recipeInput.val() === '') {
            $recipeCloseBtn.removeClass('active');
        }
    });

    $recipeCloseBtn.on('click', function() {
        $recipeInput.val('');
        $recipeCloseBtn.removeClass('active');
        query = '';
        currentPage = 1;
        loadRecipes(currentPage);
    });

    $searchBtn.on('click', function() {
        if ($recipeInput.val() !== '') {
            $recipeCloseBtn.addClass('active');
        }
    });
});

$(document).ready(function() {
    function updateCarouselAnimation() {
        var windowWidth = $(window).width();
        var $carousel = $('.categories__card');
        var animationDuration = 20000;
        
        if (windowWidth >= 1150) {
            $carousel.css('animation', 'none');
        } else {
            $carousel.css('animation', `scroll-left ${animationDuration}ms linear infinite`);

            setInterval(function() {
                if ($carousel.hasClass('reverse')) {
                    $carousel.removeClass('reverse');
                    $carousel.css('animation', `scroll-left ${animationDuration}ms linear infinite`);
                } else {
                    $carousel.addClass('reverse');
                    $carousel.css('animation', `scroll-right ${animationDuration}ms linear infinite`);
                }
            }, animationDuration);
        }
    }

    updateCarouselAnimation();

    $(window).resize(function() {
        updateCarouselAnimation();
    });
});

$(document).ready(function() {
    $('.header__menu').click(function() {
        $('.header__menu').toggleClass('change');
    });
});