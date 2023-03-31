
const express = require("express")
const { open } = require("sqlite")
const sqlite3 = require("sqlite3")
const path = require("path")
const databasePath = path.join(__dirname, "covid19India.db")
const app = express()
app.use(express.json())

let database = null

const instalizeDatabaseAndServer = async () => {
    try{
        database = await open({
            filename: databasePath,
            driver: sqlite3.database,
        })
        app.listen(3000, () => 
            console.log("Server Running at http://localhost:3000/")
        )
    }catch(error){
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
    }

}

instalizeDatabaseAndServer()

const convertStatedbObjectToResponseObject = (dbObject) => {
    return{
        stateId: dbObject.state_id
        stateName: dbObject.state_name
        population: dbObject.population
    }
}

const convertDistrictdbToResponseObject = (dbObject) => {
    return{
        districtId: dbObject.district_id
        districtName: dbObject.district_name
        stateId: dbObject.state_id
        cases: dbObject.cases
        cured: dbObject.cured
        active: dbObject.active
        deaths: dbObject.deaths
    }
}
//  GET

app.get("/states/", async(request, response) => {
    const getStates = `
    SELECT
    * 
    FROM 
    state;
    `
    const stateArray = await database.all(getStates)
    response.send(
        stateArray.map((eachState) => convertStatedbObjectToResponseObject(eachState)
        )
    )
})

//  GET

app.get("/states/:stateId/", async(request, response) => {
    const { stateId } = request.params
    const getStaetsById =`
    SELECT
    *
    FROM
    state
    WHERE
    state_id = ${stateId}`;
    const statesArray = await database.get(getStaetsById)
    response.send(convertStatedbObjectToResponseObject(statesArray))
})

// POST

app.post("/districts/", async(request, response) => {
    const { stateId, districtName, cases, cured, active, deaths } = request.body
    const postDistrict = `
    INSERT INTO
    district (state_id, district_name, cases, cured, active, deaths )
    VALUES
    (${stateId}, '${districtName}', ${cases}, ${cured}, ${active}, ${deaths});`;
    await database.run(postDistrict)
    response.send("District Successfully Added")
})





// GET

app.get("/districts/:districtId/", async(request, response) => {
    const { districtId } = request.params
    const getDistrictById =`
    SELECT
    *
    FROM
    district
    WHERE
    district_id = ${districtId}`;
    const DistrictArray = await database.get(getDistrictById)
    response.send(convertDistrictdbToResponseObject(DistrictArray))
})



// DELETE


app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDisrtict = `
  DELETE FROM
  district
  WHERE
  district_id = ${districtId};`;
  await database.run(deleteDisrtict);
  response.send("District Removed");
});


//   PUT

app.put("/districts/:districtId/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const { districtId } = request.params;
  const updateDistrictQuery = `
            UPDATE
              district
            SET
              district_name = '${districtName}',
              state_id = '${stateId}'
              cases = '${cases}'
              cured = '${cured}'
              active = '${active}'
              deaths = '${deaths}'
            WHERE
              district_id = ${districtId};`;

  await database.run(updateMovieQuery);
  response.send("District Details Updated");
});


// GET

app.get("/states/:stateId/stats/", async(request, response) => {
    const { stateId } = request.params
    const getDistrictStatics =`
    SELECT
    SUM(cases), 
    SUM(cured), 
    SUM(active),
    SUM(deaths)
    FROM
    district
    WHERE
    state_id = ${stateId}`;
    const stats = await database.get(getDistrictStatics)
    response.send({
    totalCases: stats["SUM(cases)"],
    totalCured: stats["SUM(cured)"],
    totalActive: stats["SUM(active)"],
    totalDeaths: stats["SUM(deaths)"],
  });
})



// GET

app.get("/districts/:districtId/details/", async(request, response) => {
    const { districtId } = request.params
    const getStateNameQuery =`
    SELECT
    state_name
    FROM
    district
    NATURAL JOIN
    state
    WHERE
    district_id = ${districtId}`;
    const state = await database.get(getStateNameQuery)
    response.send({ stateName: state.state_name });
})




module.exports = app



