import React from "react";
import "../style/_createemployee.scss";
import Footer from "../components/Footer";
import { Link } from "react-router";

export default function CreateEmployee() {
  return (
    <div className="mainOfCreateEmployee">
      <div className="imgContainer">
              <Link to='/access_staff'>
                <img src="اعزمك-01.png" alt="" className="img"/>
              </Link>
      </div>
      <h1>Create Employee</h1>
      <form className="createEmployee">
        <div className="form">
          <div className="inputs">
            <label>Name</label>
            <input type="text" />
          </div>

          <div className="inputs">
            <label>Phone Number</label>
            <input type="tel" />
          </div>

          <div className="inputs">
            <label>Email</label>
            <input type="email" />
          </div>
          <div className="btnContainer">
            <button type="submit">Submit</button>
          </div>
        </div>
      </form>

      <Footer />
    </div>
  );
}
