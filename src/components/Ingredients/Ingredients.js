import React, { useState, useEffect, useCallback } from "react";

import IngredientForm from "./IngredientForm";
import IngredientList from "./IngredientList";
import ErrorModal from '../UI/ErrorModal';
import Search from "./Search";

const Ingredients = () => {
  const [userIngredients, setUserIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  useEffect(() => {
    fetch(
      "https://hooks-http-af358-default-rtdb.firebaseio.com/ingredients.json"
    )
      .then((response) => response.json())
      .then((responseData) => {
        const loadedIngredients = [];

        for (const key in responseData) {
          loadedIngredients.push({
            id: key,
            title: responseData[key].title,
            amount: responseData[key].amount,
          });
        }

        setUserIngredients(loadedIngredients);
      });
  }, []);

  const filteredIngredientsHandler = useCallback((filteredIngredients) => {
    setUserIngredients(filteredIngredients);
  }, []);

  const addIngredientHandler = async (ingredient) => {
    setIsLoading(true);
    await fetch(
      "https://hooks-http-af358-default-rtdb.firebaseio.com/ingredients.json",
      {
        method: "POST",
        body: JSON.stringify(ingredient),
        headers: { "Content-Type": "application/json" },
      }
    )
      .then((response) => {
        setIsLoading(false);
        return response.json();
      })
      .then((responseData) => {
        setUserIngredients((prevIngredients) => [
          ...prevIngredients,
          { id: responseData.name, ...ingredient },
        ]);
      });
  };

  const removeIngredientHandler = (ingredientId) => {
    setIsLoading(true);
    fetch(
      `https://hooks-http-af358-default-rtdb.firebaseio.com/ingredients/${ingredientId}.json`,
      {
        method: "DELETE",
      }
    ).then((response) => {
      setIsLoading(false);
      setUserIngredients((prevIngredients) =>
        prevIngredients.filter((ingredient) => ingredient.id !== ingredientId)
      );
    }).catch((error) => {
      setError('Something went wrong!');
      setIsLoading(false);
    });
  };

  const clearError = () => {
    setError(null);
  }

  return (
    <div className="App">
      {error && <ErrorModal onClose={clearError}>{error}</ErrorModal>}

      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={isLoading}
      />

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        <IngredientList
          ingredients={userIngredients}
          onRemoveItem={removeIngredientHandler}
        />
      </section>
    </div>
  );
};

export default Ingredients;
