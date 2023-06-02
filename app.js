const express = require("express");
const app = express();
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
app.use(express.json());

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
//API 1

app.get("/todos/", async (request, response) => {
  const { status, priority, search_q, category } = request.query;
  //   let getQuery;
  //   if (Object.keys(request.query).length === 1) {
  //     getQuery = `
  //         SELECT * FROM todo
  //         WHERE todo LIKE '%${search_q}%' OR
  //         priority = '${priority}' OR
  //         status = '${status}' OR
  //         category = '${category}'
  //         ;`;
  //   } else {
  //     if (status !== undefined && priority !== undefined) {
  //       getQuery = `
  //         SELECT * FROM todo WHERE status = '${status}' AND priority = '${priority}'; `;
  //     } else if (category !== undefined && priority !== undefined) {
  //       getQuery = `
  //         SELECT * FROM todo WHERE category = '${category}' AND priority = '${priority}'; `;
  //     } else if (category !== undefined && status !== undefined) {
  //       getQuery = `
  //         SELECT * FROM todo WHERE status = '${status}' AND category = '${category}'; `;
  //     }
  //   }
  const getQuery = `
        SELECT * FROM todo
        WHERE todo LIKE '%${search_q}%' OR 
        priority = '${priority}' OR 
        status = '${status}' OR 
        category = '${category}'
        ;`;
  const getItem = await db.all(getQuery);
  response.send(getItem);
});

//API 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const getQuery = `
    SELECT * FROM todo WHERE id = ${todoId}; `;
  const getItem = await db.get(getQuery);
  response.send(getItem);
});

//API 3
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;

  const getQuery = `
  SELECT * FROM todo WHERE due_date = '${date}';`;
  const getItem = await db.all(getQuery);
  response.send(getItem);
});

//API 4
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
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
  const {
    status = tableValues.status,
    priority = tableValues.priority,
    todo = tableValues.todo,
    category = tableValues.category,
    dueDate = tableValues.due_date,
  } = request.body;
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
