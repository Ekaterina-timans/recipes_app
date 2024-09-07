$(document).ready(function() {
    initRecipePage();
    $('.container__btn').on('click', toggleFavoriteRecipe);
});

function initRecipePage() {
    const recipeData = getRecipeDataFromStorage();
    if (recipeData) {
        displayRecipeData(recipeData);
        checkFavoriteStatus(recipeData.title);
        updateIngredientsDisplay();
    } else {
        redirectToHome();
    }
}

function getRecipeDataFromStorage() {
    return JSON.parse(localStorage.getItem('selectedRecipe'));
}

function displayRecipeData(recipeData) {
    const highResImage = recipeData.image.replace('312x231', '636x393');
    
    $('.container__recipe-image').attr('src', highResImage);
    $('.container__recipe-title').text(recipeData.title);
    $('.container__time').text(recipeData.totalTime ? `${recipeData.totalTime} minutes` : 'Неизвестно');
    $('.container__kitchen-title').text(recipeData.cuisineType);
    $('.container__calories').text(Math.round(recipeData.calories));
    $('.container__fats').text(recipeData.fats.toFixed(2));
    $('.container__proteins').text(recipeData.proteins.toFixed(2));
    $('.container__carbohydrates').text(recipeData.carbohydrates.toFixed(2));
    $('.container__instructions-text').text(recipeData.instructions);
    
    recipeData.ingredients.forEach(displayIngredient);
}

function displayIngredient(ingredient) {
    const ingredientImage = ingredient.image.replace('100x100', '250x250');
    let ingredientHtml;
    if (window.innerWidth < 624) {
        ingredientHtml = `<p class="container__ingredient-name">${ingredient.food}</p>`;
    } else {
        ingredientHtml = `
            <div class="container__ingredients-card">
                <img class="container__ingredients-image" src="${ingredientImage}" alt="${ingredient.food}" width="151" height="115">
                <p class="container__ingredient">${ingredient.food}</p>
            </div>
        `;
    }
    $('.container__ingredients-cards').append(ingredientHtml);
}

function updateIngredientsDisplay() {
    const recipeData = getRecipeDataFromStorage();
    if (recipeData) {
        $('.container__ingredients-cards').empty();
        recipeData.ingredients.forEach(displayIngredient);
    }
}

$(window).on('resize', function() {
    updateIngredientsDisplay();
});

function checkFavoriteStatus(title) {
    const favoriteRecipes = JSON.parse(localStorage.getItem('favoriteRecipes')) || [];
    const isFavorite = favoriteRecipes.some(recipe => recipe.title === title);

    if (isFavorite) {
        $('.container__btn .bxs-heart').addClass('active');
    } else {
        $('.container__btn .bxs-heart').removeClass('active');
    }
}

function redirectToHome() {
    window.location.href = 'index.html';
}

function toggleFavoriteRecipe() {
    const heartIcon = $(this).find('.bxs-heart');
    const recipeData = getRecipeDataFromStorage();
    let favoriteRecipes = JSON.parse(localStorage.getItem('favoriteRecipes')) || [];

    if (heartIcon.hasClass('active')) {
        favoriteRecipes = favoriteRecipes.filter(recipe => recipe.title !== recipeData.title);
        heartIcon.removeClass('active').addClass('spin');
    } else {
        favoriteRecipes.push(recipeData);
        heartIcon.addClass('active spin');
    }

    localStorage.setItem('favoriteRecipes', JSON.stringify(favoriteRecipes));
    setTimeout(() => heartIcon.removeClass('spin'), 1000);
}

$(document).ready(function() {
    $('.header__menu').click(function() {
        $('.header__menu').toggleClass('change');
    });
});