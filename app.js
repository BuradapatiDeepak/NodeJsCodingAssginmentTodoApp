const express = require("express");
const app = express();
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
app.use(express.json());
const { parseISO, format, isValid } = require("date-fns");
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const initDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
  } catch (error) {
    console.log(`DB Error ${error.message}`);
  }
  app.listen(3000, () => {
    console.log("Server Started Successfully");
  });
};

initDBAndServer();
// if (priority === "HIGH" || priority === "LOW" || priority === "MEDIUM") {
//     console.log("verified");
//   } else {
//     response.status(400);
//     response.send("Invalid Todo Priority");
//   }
//   if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
//     console.log("verified");
//   } else {
//     response.status(400);
//     response.send("Invalid Todo Status");
//   }
//   if (category === "WORK" || category === "HOME" || category === "LEARNING") {
//     console.log("verified");
//   } else {
//     response.status(400);
//     response.send("Invalid Todo Category");
//   }

const priorityArray = ["HIGH", "MEDIUM", "LOW"];
const statusArray = ["TO DO", "IN PROGRESS", "DONE"];
const categoryArray = ["WORK", "HOME", "LEARNING"];
// Function to format the date
const formattingDate = (date) => {
  const dateString = new Date(date);
  date = format(dateString, "yyyy-MM-dd");
  return date;
};

//API 1
app.get("/todos/", async (request, response) => {
  const { status, priority, search_q, category } = request.query;
  // VALIDATION

  const statusValidationCheck = statusArray.includes(status);
  const priorityValidationCheck = priorityArray.includes(priority);
  const categoryValidationCheck = categoryArray.includes(category);
  if (status !== undefined) {
    if (statusValidationCheck === false) {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  }

  if (priority !== undefined) {
    if (priorityValidationCheck === false) {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  }
  if (category !== undefined) {
    if (categoryValidationCheck === false) {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  }
  let getQuery;
  if (Object.keys(request.query).length === 1) {
    getQuery = `
                SELECT 
                id, todo, priority, status, category, due_date as dueDate FROM todo
                WHERE todo LIKE '%${search_q}%' OR 
                priority = '${priority}' OR 
                status = '${status}' OR 
                category = '${category}'
                ;`;
  } else if (Object.keys(request.query).length === 0) {
    getQuery = `SELECT * FROM todo;`;
  } else {
    if (status !== undefined && priority !== undefined) {
      getQuery = `
          SELECT id, todo, priority, status, category, due_date as dueDate 
          FROM todo WHERE status = '${status}' AND priority = '${priority}'; `;
    } else if (category !== undefined && priority !== undefined) {
      getQuery = `
          SELECT id, todo, priority, status, category, due_date as dueDate 
          FROM todo WHERE category = '${category}' AND priority = '${priority}'; `;
    } else if (category !== undefined && status !== undefined) {
      getQuery = `
          SELECT id, todo, priority, status, category, due_date as dueDate 
          FROM todo WHERE status = '${status}' AND category = '${category}'; `;
    }
  }
  const getItem = await db.all(getQuery);
  response.send(getItem);
});

//API 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const getQuery = `
    SELECT id, todo, priority, status, category, due_date as dueDate FROM todo WHERE id = ${todoId}; `;
  const getItem = await db.get(getQuery);
  response.send(getItem);
});

//API 3
app.get("/agenda/", async (request, response) => {
  let { date } = request.query;
  const isValidDate = isValid(parseISO(date));

  if (isValidDate === false) {
    response.status(400);
    response.send("Invalid Due Date");
  } else {
    date = formattingDate(date);
    const getQuery = `
  SELECT id, todo, priority, status, category, due_date as dueDate FROM todo WHERE due_date = '${date}';`;
    const getItem = await db.all(getQuery);
    response.send(getItem);
  }
});

//API 4
app.post("/todos/", async (request, response) => {
  let { id, todo, priority, status, category, dueDate } = request.body;
  dueDate = formattingDate(dueDate);
  const statusValidationCheck = statusArray.includes(status);
  const priorityValidationCheck = priorityArray.includes(priority);
  const categoryValidationCheck = categoryArray.includes(category);
  if (status !== undefined) {
    if (statusValidationCheck === false) {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  }

  if (priority !== undefined) {
    if (priorityValidationCheck === false) {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  }
  if (category !== undefined) {
    if (categoryValidationCheck === false) {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  }
  console.log(request.body);
  const postQuery = `
    INSERT INTO todo(id, todo, priority, status, category, due_date)
    VALUES (${id}, '${todo}', '${priority}', '${status}', '${category}', '${dueDate}'); `;
  await db.run(postQuery);
  response.send("Todo Successfully Added");
});

//API 5
app.put("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;

  const tableValuesQuery = `
    SELECT * FROM todo WHERE id = ${todoId};`;
  const tableValues = await db.get(tableValuesQuery);
  const requestBody = request.body;
  let value = Object.keys(requestBody)[0];
  switch (value) {
    case "status":
      value = "Status";
      break;
    case "priority":
      value = "Priority";
      break;
    case "todo":
      value = "Todo";
      break;
    case "category":
      value = "Category";
      break;
    case "dueDate":
      value = "Due Date";
      break;

    default:
      break;
  }
  let {
    status = tableValues.status,
    priority = tableValues.priority,
    todo = tableValues.todo,
    category = tableValues.category,
    dueDate = tableValues.due_date,
  } = request.body;
  dueDate = formattingDate(dueDate);
  const statusValidationCheck = statusArray.includes(status);
  const priorityValidationCheck = priorityArray.includes(priority);
  const categoryValidationCheck = categoryArray.includes(category);
  if (status !== undefined) {
    if (statusValidationCheck === false) {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  }

  if (priority !== undefined) {
    if (priorityValidationCheck === false) {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  }
  if (category !== undefined) {
    if (categoryValidationCheck === false) {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  }
  const putQuery = `
  UPDATE todo 
  SET status = '${status}',
  priority = '${priority}',
  todo = '${todo}',
  category = '${category}',
  due_date = '${dueDate}'
  WHERE id = ${todoId};`;
  await db.run(putQuery);
  response.send(`${value} Updated`);
});
//API 6
app.delete("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `
    DELETE FROM todo WHERE id = ${todoId};`;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
