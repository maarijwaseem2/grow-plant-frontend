import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./ReforestationPage.css";

// Import your images
import stopDeforestationIcon from "../../modules/Icons/deforestation.PNG";
import fightClimateChangeIcon from "../../modules/Icons/climate-change.PNG";
import supportLocalCommunitiesIcon from "../../modules/Icons/local-communities.PNG";
import worldMapImage from "../../modules/images/map.PNG";

const ReforestationPage = () => {
  return (
    <Container fluid className="text-center py-5">
      <h1 className="gather-coordinate mb-4 custom-title">We gather and coordinate reforestation projects worldwide to:</h1>
      
      {/* Features section */}
      <Row className="mb-0 justify-content-center custom-margin">
        {/* First feature */}
        <Col md={4} className="mb-4 d-flex flex-column align-items-center">
          <div className="text-left-align">
            <img
              src={stopDeforestationIcon}
              alt="Stop deforestation"
              className="feature-icon mb-3"
              style={{ width: '80px', height: '80px' }}
            />
            <h4 className="deforestation-text">Stop deforestation</h4>
            <p className="projects-text">
              Each of our projects fights back against the 
              <br />
              alarming rates of global deforestation.
            </p>
          </div>
        </Col>

        {/* Second feature */}
        <Col md={4} className="mb-4 d-flex flex-column align-items-center">
          <div className="text-left-align">
            <img
              src={fightClimateChangeIcon}
              alt="Fight climate change"
              className="feature-icon mb-3"
              style={{ width: '80px', height: '80px' }}
            />
            <h4 className="climate-text">Fight climate change</h4>
            <p className="scientific-text">
              Planting trees has been recognized by the 
              <br />
              scientific community as a vital pillar to tackle climate change.
            </p>
          </div>
        </Col>

        {/* Third feature */}
        <Col md={4} className="mb-4 d-flex flex-column align-items-center">
          <div className="text-left-align">
            <img
              src={supportLocalCommunitiesIcon}
              alt="Support local communities"
              className="feature-icon mb-3"
              style={{ width: '80px', height: '80px' }}
            />
            <h4 className="communities-text">Support local communities</h4>
            <p className="economic-text">
              Our projects also generate a 
              <br />
              positive economic impact on local populations.
            </p>
          </div>
        </Col>
      </Row>
      
      {/* World map and image */}
      <Row className="map-container">
        <Col md={10} className="text-center">
          <img
            src={worldMapImage}
            alt="World Map"
            className="world-map" // Apply the new world-map class
          />
        </Col>
      </Row>
    </Container>
  );
};

export default ReforestationPage;
