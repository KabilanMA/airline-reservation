const bcrypt = require("bcrypt");
const express = require("express");
const mysql = require("mysql");
require("dotenv").config();
//Database
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE_NAME,
    multipleStatements: true,

});

db.connect(function (err) {
    if (err) {
        console.log("DB error");
        throw err;
    }
});

const app = express.Router();

app.post("/login", (req, res) => {
    // console.log("Request to login");
    let email = req.body.email;
    let password = req.body.password;
    email = email.toLowerCase().trim();

    if (email.length > 50 || password.length > 50) {
        res.json({
            success: false,
            msg: "Not an authorized request",
        });
        return;
    }

    let cols = [email];
    db.query(
        "SELECT * FROM user WHERE email = ? LIMIT 1",
        cols,
        (err, data, fields) => {
            if (err) {
                res.json({
                    success: false,
                    msg: "Error occured while querying the data",
                });
                return;
            }

            //Found a user
            if (data && data.length === 1) {
                bcrypt.compare(password, data[0].password, (bcryptErr, verified) => {
                    if (verified) {
                        req.session.userID = data[0].user_id;
                        res.json({
                            success: true,
                            email: data[0].email,
                            role: data[0].role,
                        });
                        // console.log(`Successfully sending back ${data[0].email}`);

                    } else {
                        res.json({
                            success: false,
                            msg: "Invalid password",
                        });
                    }
                });
            } else {
                res.json({
                    success: false,
                    msg: "User not found",
                });
            }
        }
    );
});

app.post("/logout", (req, res) => {
    if (req.session.userID) {
        req.session.destroy();
        res.json({
            success: true,
        });

        return true;
    } else {
        res.json({
            success: false,
        });

        return false;
    }
});

app.post("/isLoggedIn", (req, res) => {
    if (req.session.userID) {
        let cols = [req.session.userID];
        db.query(
            "SELECT * FROM user WHERE user_id = ? LIMIT 1",
            cols,
            (err, data, fields) => {
                if (data && data.length === 1) {
                    res.json({
                        success: true,
                        email: data[0].email,
                        role: data[0].role,
                    });

                    return true;
                } else {
                    res.json({
                        success: false,
                    });
                }
            }
        );
    } else {
        res.json({
            success: false,
        });
    }
});

app.post("/fetchFlight/clerk", (req, res) => {
    if (req.session.userID) {
        if (
            req.body.flight_id !== "" &&
            req.body.aircraft_id === "" &&
            req.body.origin === "" &&
            req.body.destination === ""
        ) {
            if (req.body.past === true) {
                if (req.body.future === true) {
                    db.query(
                        "select flight_id, takeoff_time, departure_time, model, airport1.code as origin, airport2.code as destination from flight left join aircraft using(aircraft_id) left join route using(route_id) left join airport as airport1 on airport1.airport_id = route.origin left join airport as airport2 on airport2.airport_id=route.destination where flight_id=?",
                        [req.body.flight_id],
                        (err, data, fields) => {
                            if (err) {
                                console.error(err);
                                res.json({
                                    success: false,
                                });
                                return false;
                            } else {
                                res.json({
                                    success: true,
                                    data: data,
                                });
                                return true;
                            }
                        }
                    );
                } else {
                    db.query(
                        "select flight_id, takeoff_time, departure_time, model, airport1.code as origin, airport2.code as destination from flight left join aircraft using(aircraft_id) left join route using(route_id) left join airport as airport1 on airport1.airport_id = route.origin left join airport as airport2 on airport2.airport_id=route.destination where takeoff_time < now() and flight_id=?",
                        [req.body.flight_id],
                        (err, data, fields) => {
                            if (err) {
                                console.error(err);
                                res.json({
                                    success: false,
                                });
                                return false;
                            } else {
                                res.json({
                                    success: true,
                                    data: data,
                                });
                                return true;
                            }
                        }
                    );
                }
            } else {
                if (req.body.future === true) {
                    db.query(
                        "select flight_id, takeoff_time, departure_time, model, airport1.code as origin, airport2.code as destination from flight left join aircraft using(aircraft_id) left join route using(route_id) left join airport as airport1 on airport1.airport_id = route.origin left join airport as airport2 on airport2.airport_id=route.destination where takeoff_time > now() and flight_id=?",
                        [req.body.flight_id],
                        (err, data, fields) => {
                            if (err) {
                                console.error(err);
                                res.json({
                                    success: false,
                                });
                                return false;
                            } else {
                                res.json({
                                    success: true,
                                    data: data,
                                });
                                return true;
                            }
                        }
                    );
                } else {
                    res.json({
                        success: false,
                    });
                    return false;
                }
            }
        } else if (
            req.body.aircraft_id !== "" &&
            req.body.flight_id === "" &&
            req.body.origin === "" &&
            req.body.destination === ""
        ) {
            if (req.body.past === true) {
                if (req.body.future === true) {
                    db.query(
                        "select flight_id, takeoff_time, departure_time, model, airport1.code as origin, airport2.code as destination from flight left join aircraft using(aircraft_id) left join route using(route_id) left join airport as airport1 on airport1.airport_id = route.origin left join airport as airport2 on airport2.airport_id=route.destination where aircraft_id =?",
                        [req.body.aircraft_id],
                        (err, data, fields) => {
                            if (err) {
                                console.error(err);
                                res.json({
                                    success: false,
                                });
                                return false;
                            } else {
                                res.json({
                                    success: true,
                                    data: data,
                                });
                                return true;
                            }
                        }
                    );
                } else {
                    db.query(
                        "select flight_id, takeoff_time, departure_time, model, airport1.code as origin, airport2.code as destination from flight left join aircraft using(aircraft_id) left join route using(route_id) left join airport as airport1 on airport1.airport_id = route.origin left join airport as airport2 on airport2.airport_id=route.destination where aircraft_id =? and takeoff_time < now()"[
                            req.body.aircraft_id
                            ],
                        (err, data, fields) => {
                            if (err) {
                                console.error(err);
                                res.json({
                                    success: false,
                                });
                                return false;
                            } else {
                                res.json({
                                    success: true,
                                    data: data,
                                });
                                return true;
                            }
                        }
                    );
                }
            } else {
                if (req.body.future === true) {
                    db.query(
                        "select flight_id, takeoff_time, departure_time, model, airport1.code as origin, airport2.code as destination from flight left join aircraft using(aircraft_id) left join route using(route_id) left join airport as airport1 on airport1.airport_id = route.origin left join airport as airport2 on airport2.airport_id=route.destination where aircraft_id =? and takeoff_time > now()",
                        [req.body.aircraft_id],
                        (err, data, fields) => {
                            if (err) {
                                console.error(err);
                                res.json({
                                    success: false,
                                });
                                return false;
                            } else {
                                res.json({
                                    success: true,
                                    data: data,
                                });
                                return true;
                            }
                        }
                    );
                } else {
                    res.json({
                        success: false,
                    });
                    return false;
                }
            }
        } else if (
            req.body.origin !== "" &&
            req.body.destination !== "" &&
            req.body.flight_id === "" &&
            req.body.aircraft_id === ""
        ) {
            if (req.body.past === true) {
                if (req.body.future === true) {
                    db.query(
                        "select flight_id, model, p1.location as origin, p2.location as destination, flight.takeoff_time, flight.departure_time from flight left join aircraft on flight.aircraft_id=aircraft.aircraft_id left join route on route.route_id=flight.route_id left join airport as airport1 on airport1.airport_id=route.origin left join port_location as p1 on p1.id=route.origin left join port_location as p2 on p2.id=route.destination having origin=? and destination=?",
                        [req.body.origin.trim(), req.body.destination.trim()],
                        (err, data, fields) => {
                            console.log("READ");

                            if (err) {
                                console.error(err);
                                res.json({
                                    success: false,
                                });
                                return false;
                            } else {
                                res.json({
                                    success: true,
                                    data: data,
                                });
                                return true;
                            }
                        }
                    );
                } else {
                    db.query(
                        "select flight_id, model, p1.location as origin, p2.location as destination, flight.takeoff_time, flight.departure_time from flight left join aircraft on flight.aircraft_id=aircraft.aircraft_id left join route on route.route_id=flight.route_id left join airport as airport1 on airport1.airport_id=route.origin left join port_location as p1 on p1.id=route.origin left join port_location as p2 on p2.id=route.destination having origin=? and destination=? and takeoff_time < now()",
                        [req.body.origin.trim(), req.body.destination.trim()],
                        (err, data, fields) => {
                            if (err) {
                                console.error(err);
                                res.json({
                                    success: false,
                                });
                                return false;
                            } else {
                                res.json({
                                    success: true,
                                    data: data,
                                });
                                return true;
                            }
                        }
                    );
                }
            } else {
                if (req.body.future === true) {
                    db.query(
                        "select flight_id, model, p1.location as origin, p2.location as destination, flight.takeoff_time, flight.departure_time from flight left join aircraft on flight.aircraft_id=aircraft.aircraft_id left join route on route.route_id=flight.route_id left join airport as airport1 on airport1.airport_id=route.origin left join port_location as p1 on p1.id=route.origin left join port_location as p2 on p2.id=route.destination having origin=? and destination=? and takeoff_time > now()",
                        [req.body.origin.trim(), req.body.destination.trim()],
                        (err, data, fields) => {
                            if (err) {
                                console.error(err);
                                res.json({
                                    success: false,
                                });
                                return false;
                            } else {
                                res.json({
                                    success: true,
                                    data: data,
                                });
                                return true;
                            }
                        }
                    );
                } else {
                    res.json({
                        success: false,
                    });
                    return false;
                }
            }
        } else {
            res.json({
                success: false,
            });
            return false;
        }
    }
});

app.post("/bookingFlights", (req, res) => {
    if (req.session.userID) {
        db.query(
            "select flight_id, takeoff_time, departure_time, model, Economy_seats, Business_seats, Platinum_seats, airport1.code as origin, airport2.code as destination from flight inner join aircraft using(aircraft_id) inner join route using (route_id) inner join airport as airport1 on airport1.airport_id=route.origin inner join airport as airport2 on airport2.airport_id=route.destination where takeoff_time > now() order by takeoff_time",
            (err, data, fields) => {
                if (err) {
                    res.json({
                        success: false,
                    });
                } else {
                    res.json({
                        success: true,
                        data: data,
                    });
                }
            }
        );
    } else {
        req.json({
            success: false,
        });
    }
});

app.post("/loadSeatnumber", (req, res) => {
    if (req.session.userID) {
        let flight_id = parseInt(req.body.flight_id);
        let seat_inclass = req.body.class;
        let stmt = "";
        if (seat_inclass == "Economy") {
            stmt = "SELECT get_Economy_seats(?)";
        } else if (seat_inclass == "Business") {
            stmt = "SELECT get_Business_seats(?)";
        } else {
            stmt = "SELECT get_Platinum_seats(?)";
        }

        db.query(stmt, [flight_id], (err, data, fields) => {
            if (err) {
                console.log(err);
                res.json({
                    success: false,
                });
            } else {
                res.json({
                    success: true,
                    seat_number: data[0],
                });
            }
        });
    }
});

app.post("/bookTicket", (req, res) => {
    if (req.session.userID) {
        db.query(
            "SELECT cost FROM flight LEFT JOIN flight_cost USING(flight_id) WHERE flight_id=? AND class=?",
            [req.body.flight_id, req.body.class],
            (err, data1, fields) => {
                if (err) {
                    console.log(err);
                    res.status(500);
                    res.json({
                        success: false,
                        msg: "Error Fetching the Cost of the Flight",
                    });

                } else {
                    db.query(
                        "CALL book_ticket(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        [
                            req.body.passenger_id,
                            req.body.passenger_name,
                            req.body.date,
                            req.body.passenger_address,
                            req.session.userID,
                            req.body.flight_id,
                            req.body.seat_number,
                            req.body.date,
                            req.body.class,
                            data1[0].cost,
                        ],
                        (err, fields) => {
                            if (err) {
                                res.status(500);
                                res.json({
                                    success: false,
                                    msg: "Error Booking the Ticket",
                                });

                            } else {
                                res.json({
                                    success: true,
                                    msg: "Booking Successful",
                                });

                            }
                        }
                    );
                }
            }
        );
    }
});

app.get("/location", (req, res) => {
    db.query("SELECT * from port_location_with_parent", (err, data) => {
        if (err) {
            res.status(500);
            res.json({success: false});
        } else {
            res.json({
                success: true,
                locations: data,
            });
        }
    });
});


app.post("/search-result", function(req, res) {
    // console.log(req.body)
    var flightDetails = null;
    const depText = req.body.depDate;
    const departingDate = depText.split("T")[0];
  
    const desText = req.body.retDate;
    const destinationDate = desText.split("T")[0];
  
    const departingAirportCode = req.body.depAirCode;
    const destinationAirportCode = req.body.desAirCode;
  
    db.query(
      `select route_id as r1_id from route where destination=(select airport_id from airport where code="${destinationAirportCode}") and origin=(select airport_id from airport where code="${departingAirportCode}");
      `,
      function(err, result) {
        
        if (err) {
          res.json({ success: false });
        }
        
        if (result.length != 0) {
          var route_id = JSON.stringify(result[0]["r1_id"]);
  
          if (route_id != null) {
            db.query(
              `select * from flight where route_id='${route_id}' and DATE(takeoff_time)='${departingDate}'`,
              function(err, result) {
                if (err) {

                  res.json({ success: false });
                }
                flightDetails = result;
  
                db.query(
                    `select route_id as r2_id from route where origin=(select airport_id from airport where code="${destinationAirportCode}") and destination=(select airport_id from airport where code="${departingAirportCode}");`,
                    (err, result) => {
                    if (err) {

                      res.json({ success: false });
                    }
                    if (result.length != 0) {
                      var return_route_id = JSON.stringify(result[0]["r2_id"]);
                      if (return_route_id != null) {
                        db.query(
                          `select * from flight where route_id='${return_route_id}' and DATE(takeoff_time)='${destinationDate}'`,
                          (err, result) => {
                              
                            if (err) {

                              res.json({ success: false });
                            } else {
                             
                              res.json({
                                success: true,
                                data: flightDetails,
                                return_data: result,
                              });
                            }
                          }
                        );
                      }
                    }
                  }
                );
              }
            );
          }
        } else {

          res.json({ success: true, data: flightDetails });
        }
      }
    );
  });
  
  app.post("/flightCard", function(req, res) {
    const f_id = req.body.flight_id;
    const a_id = req.body.aircraft_id;
    let eco_booked_seats = [];
    let busi_booked_seats = [];
    let plat_booked_seats = [];
    let Economy_seats, Business_seats, Platinum_seats;
  
    const promise1 = new Promise((resolve, reject) => {
      db.query(
        `select seat_number from ticket where flight_id=${f_id} and class ='Economy';select seat_number from ticket where flight_id=${f_id} and class ='Business';select seat_number from ticket where flight_id=${f_id} and class ='Platinum';select Economy_seats,Business_seats,Platinum_seats from aircraft where aircraft_id=${a_id};`,
        function(err, result) {
          if (err) throw err;
          for (let i = 0; i < result[0].length; i++) {
            eco_booked_seats.push(Number(result[0][i]["seat_number"]));
          }
          for (let i = 0; i < result[1].length; i++) {
            busi_booked_seats.push(Number(result[1][i]["seat_number"]));
          }
          for (let i = 0; i < result[2].length; i++) {
            plat_booked_seats.push(Number(result[2][i]["seat_number"]));
          }
          Economy_seats = Number(result[3][0]["Economy_seats"]);
          Business_seats = Number(result[3][0]["Business_seats"]);
          Platinum_seats = Number(result[3][0]["Platinum_seats"]);
  
          resolve({
            eco_booked_seats,
            busi_booked_seats,
            plat_booked_seats,
            Economy_seats,
            Business_seats,
            Platinum_seats,
          });
        }
      );
    });
  
    promise1.then((value) => {
      res.json({
        seatData: { value },
      });
    });
  });
  
  app.get("/getAirports", (req, res) => {
    db.query("SELECT code,name from airport", (err, result) => {
      if (err) {
        res.json({ success: false });
      } else {
        res.json({
          success: true,
          data: result,
        });
      }
    });
  });
  
  app.post("/reserveBooking", (req, res) => {
    console.log(req.session.userID);
    console.log(req.body);
    db.query(
      "call book_ticket_proc(?,?,?,?,?,?,?,?)",
      [
        req.body.f_id,
        req.session.userID,
        req.body.passengerId,
        req.body.passengerName,
        req.body.passengerAdd,
        req.body.bDay,
        req.body.flight_class,
        req.body.seatNo,
      ],
      function(err, result) {
        if (err) {
          console.log(err);
          res.json({ success: false });
        } else {
          res.json({
            success: true,
            data: result,
          });
        }
      }
    );
  });
  
  app.post("/confirmBooking", (req, res) => {
    db.query(
      `update ticket set status=1 where flight_id=${req.body.f_id} and seat_number=${req.body.seatNo}`,
      (err, result) => {
        if (err) {
          res.json({ success: false });
        } else {
          res.json({
            success: true,
            data: result,
          });
        }
      }
    );
  });
  
  app.post("/checkValidBooking", (req, res) => {
    console.log(req.body);
  
    db.query(
      `SELECT ticket_id from ticket where flight_id=${req.body.f_id} and passenger_id='${req.body.passengerId}' and status=1`,
      (err, result) => {
        if (err) {
          res.json({ success: false });
        } else {
          db.query(
            `SELECT seat_number from ticket where flight_id=${req.body.f_id} and seat_number=${req.body.seatNo}`,
            (err2, result2) => {
              if (err2) {
                res.json({ success: false });
              } else {
                if (result2.length !== 0) {
                  res.json({
                    success: true,
                    data: "seat_occupied",
                  });
                } else {
                  if (result.length !== 0) {
                    res.json({
                      success: true,
                      data: "passenger_occupied",
                    });
                  } else {
                    res.json({
                      success: true,
                      data: "available",
                    });
                  }
                }
              }
            }
          );
        }
      }
    );
  });
  
  app.get("/isReserved", (req, res) => {
    db.query(
      `select ticket_id from ticket where flight_id=${req.query.f_id} and seat_number=${req.query.seatNo} and status=0;`,
      (err, result) => {
        if (err) {
          res.json({ success: false });
        } else {
          res.json({
            success: true,
            data: result,
          });
        }
      }
    );
  });
  
  app.delete("/releaseBooking", (req, res) => {
    db.beginTransaction(function(err) {
      if (err) throw err;
      db.query(
        `delete from  ticket where flight_id=${req.body.f_id} and seat_number=${req.body.seatNo} and status=0`,
        function(err, result) {
          if (err) {
            db.rollback(() => {
              console.log(err);
  
              res.json({ success: false });
            });
          }
          db.query(
            `delete from passenger where passenger_id='${req.body.passengerId}' and passenger_id not in (select passenger_id from ticket)`,
            function(err, result) {
              if (err) {
                console.log(err);
                db.rollback(() => {
                  res.json({ success: false });
                });
              }
              db.commit(function(err) {
                if (err) {
                  db.rollback(() => {
                    console.log(err);
  
                    res.json({ success: false });
                  });
                }
                res.json({
                  success: true,
                });
              });
            }
          );
        }
      );
    });
  
    // db.query(
    //   `delete from  ticket where flight_id=${req.body.f_id} and seat_number=${req.body.seatNo} and status=0`,
    //   (err, result) => {
    //     if (err) {
    //       res.json({ success: false });
    //     } else {
    //       res.json({
    //         success: true,
    //         data: result,
    //       });
    //     }
    //   }
    // );
  });
  
  app.get("/getTickets", (req, res) => {
    db.query(
      `select * from ticket where user_id=${req.session.userID} and status=1;`,
      (err, result) => {
        if (err) {
          res.json({ success: false });
        } else {
          res.json({
            success: true,
            data: result,
          });
        }
      }
    );
  });

  
  
module.exports = app;
