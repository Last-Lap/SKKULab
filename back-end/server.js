/* NPM Modules */
const express = require("express");
const cors = require("cors");
const path = require("path");

/* User Modules */
const db = require("./modules/DBconfig");

/* express config */
const app = express();
const port = 3000;

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/my-app/build/"));

/* Database Connect */
db.connect((err) => {
  if (err) throw err;
  console.log("DB is Connected");
});

app.post("/list/keyword", async (req, res) => {
  const { keyword } = req.body;

  // const embedding = await embedding_SBERT(keyword);  키워드 임베딩 생성
  // similarity와 research_count에 따른 추천 방식을 정해야 함

  const query = {
    text: `
      SELECT *, (1 - (research_embedding <=> $1)) AS similarity
      FROM professor
      WHERE (research_embedding <=> $1) < $2
      ORDER BY similarity DESC
      LIMIT 10
    `,
    values: [embedding, 0.5],
  };
  const result = await db.query(query);

  let resultArr = [];
  for (let i = 0; i< result.rowCount; i++) {
    let temp = {};
    temp.labid = result.rows[i].labid;
    temp.name = result.rows[i].name;
    temp.dept = result.rows[i].department;
    temp.tags = result.rows[i].research_area;
    resultArr.push(temp);
  }

  return res.status(200).json(resultArr);
});

app.post("/list/name", async (req, res) => {
  const { name } = req.body;

  const query = {
    text: `
      SELECT *
      FROM professor
      WHERE name = $1
    `,
    values: [name],
  };
  const result = await db.query(query);

  let resultArr = [];
  for (let i = 0; i< result.rowCount; i++) {
    let temp = {};
    temp.labid = result.rows[i].labid;
    temp.name = result.rows[i].name;
    temp.dept = result.rows[i].department;
    temp.tags = result.rows[i].research_area;
    resultArr.push(temp);
  }

  return res.status(200).json(resultArr);
});

app.post("/lab", async (req, res) => {
  const { labid } = req.body;

  const query = {
    text: `
      SELECT *
      FROM professor
      WHERE labid = $1
    `,
    values: [labid],
  };
  const result = await db.query(query);

  let resultArr = [];
  for (let i = 0; i< result.rowCount; i++) {
    let temp = {};
    temp.lab_description = result.rows[i].description;
    temp.tags = result.rows[i].research_area;
    temp.counts = result.rows[i].counts_research;
    temp.total = result.rows[i].total_research;
    resultArr.push(temp);
  }

  return res.status(200).json(resultArr);
});

app.post("/lab_related", async (req, res) => {
  const { name } = req.body;

  /* research_embedding에 대한 논의 필요
   * 1 . research_embedding이 vector Array로 이루어질 때 평균 벡터 간 코사인 유사도를 비교할 지
   *     or 개별 코사인 유사도와 해당 tag의 비중을 곱해서 가중치로 계산할 지
   **/
  const query = {
    text: `
      SELECT *, (1 - (research_embedding <=> $1)) AS similarity
      FROM professor
      WHERE (research_embedding <=> $1) < $2
      ORDER BY similarity DESC
      LIMIT 10
    `,
    values: [name],
  };
  const result = await db.query(query);

  let resultArr = [];
  for (let i = 0; i< result.rowCount; i++) {
    let temp = {};
    temp.labid = result.rows.labid;
    temp.name = result.rows.name;
    temp.dept = result.rows.dept;
    temp.tags = result.rows.research_area;
    resultArr.push(temp);
  }

  return res.status(200).json(resultArr);
});


/* React routing */
app.use("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/my-app/build/index.html"));
});

app.listen(port, () => {
  console.log("app listening on port ", port);
});