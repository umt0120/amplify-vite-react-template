import { useEffect, useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import {
  deleteUser,
  updateUserAttribute,
  type UpdateUserAttributeOutput,
} from "aws-amplify/auth";

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const { signOut } = useAuthenticator();

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  function createTodo() {
    client.models.Todo.create({ content: window.prompt("Todo content") });
  }

  async function handleDeleteUser() {
    try {
      await deleteUser();
    } catch (error) {
      console.error("Error deleting user", error);
    }
  }

  async function handleUpdateUserAttribute(
    attributeKey: string,
    value: string
  ) {
    try {
      const output = await updateUserAttribute({
        userAttribute: {
          attributeKey,
          value,
        },
      });
      handleUpdateUserAttributeNextSteps(output);
    } catch (error) {
      console.log(error);
    }
  }

  function handleUpdateUserAttributeNextSteps(
    output: UpdateUserAttributeOutput
  ) {
    const { nextStep } = output;

    switch (nextStep.updateAttributeStep) {
      case "CONFIRM_ATTRIBUTE_WITH_CODE":
        const codeDeliveryDetails = nextStep.codeDeliveryDetails;
        console.log(
          `Confirmation code was sent to ${codeDeliveryDetails?.deliveryMedium}.`
        );
        // Collect the confirmation code from the user and pass to confirmUserAttribute.
        break;
      case "DONE":
        console.log(`attribute was successfully updated.`);
        break;
    }
  }

  return (
    <main>
      <h1>My todos</h1>
      <button onClick={createTodo}>+ new</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.content}</li>
        ))}
      </ul>
      <div>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
          Review next step of this tutorial.
        </a>
      </div>
      <form>
        <input name="newEmail" placeholder="New email" />
        <button type="submit" onClick={
          (event) => {
            event.preventDefault();
            const newEmail = (event.target as HTMLFormElement).newEmail.value;
            handleUpdateUserAttribute("email", newEmail);
          }
        }>Update Email</button>
      </form>
      <form>
        <input name="newPassword" placeholder="New password" />
        <button type="submit" onClick={
          (event) => {
            event.preventDefault();
            const newPassword = (event.target as HTMLFormElement).newEmail.value;
            handleUpdateUserAttribute("password", newPassword);
          }
        }>Update Password</button>
      </form>
      <button onClick={signOut}>Sign out</button>
      <button onClick={handleDeleteUser}>Delete user</button>
    </main>
  );
}

export default App;
