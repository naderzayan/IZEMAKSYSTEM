import React from "react";
import "../style/_createemployee.scss";
import Footer from "../components/Footer";

export default function CreateEmployee() {
  return (
    <div className="mainOfCreateEmployee">
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

          <div className="inputs">
            <label>ID</label>
            <input type="text" />
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
