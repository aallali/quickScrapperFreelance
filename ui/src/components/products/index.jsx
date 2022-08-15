import React, { useEffect, useState } from "react";
import "./Products.css";
import {  Row, Col, Table, Image} from "react-bootstrap";
import db from "./products.json";
export default function Products() {
  const [statuFilter, setStatuFilter] = useState("new");
  const [brandFilter, setBrandFilter] = useState("")
 
  const [data, updateData] = useState(db.filter((l) => l.statu === statuFilter && l.brand?.includes(brandFilter)));
  const [brands, setBrands] = useState([])
  useEffect(() => {
    updateData(db.filter((l) => l.statu === statuFilter && (l.brand || "").includes(brandFilter)));
 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statuFilter, brandFilter]);

  useEffect(() => {
    let brandSet = new Set()
    for (let i = 0; i < db.length; i++) {
      const el = db[i]
      if (el.brand) {
        brandSet.add(el.brand)
      }
    }
    
    setBrands(Array.from(brandSet))
  }, [])

  function onClickImage(e) {
    e.target.height = e.target.height === 500 ? 50 : 500
  }

  return (
    <div className="inner-products">
      <Row>
        <Col className="col-2">
          <h5> statu filter  : </h5>
        </Col>
        <Col>
          <select   onChange={(e) => setStatuFilter(e.target.value)}>
          <option value="new">new ({db.filter((el) => el.statu === "new").length})</option>
            <option value="changed">Changed ({db.filter((el) => el.statu === "changed").length})</option>
            <option value="stable">Stable ({db.filter((el) => el.statu === "stable").length})</option>
            <option value="deleted">deleted ({db.filter((el) => el.statu === "deleted").length})</option>

          </select>
        </Col>
      </Row>
      <Row>
        <Col className="col-2">
          <h5> brand filter  : </h5>
        </Col>
        <Col>
          <select onChange={(e) => setBrandFilter(e.target.value)}>
          <option value="">all</option>
         {brands.map((l, i) => {
           return (<option key={i} value={l}>{l} ({db.filter((el) => el.statu === statuFilter && (el.brand || "").includes(l)).length})</option>)
         })}
            
          </select>
        </Col>
      </Row>
      <Row>
        <Col>

          <h4> total products with that filter {data.length} (note: only 500 elements listed in table)</h4>
        </Col>

      </Row>
      <Row>
      <Table striped bordered hover>
      <thead>
        <tr>
          <th>#</th>
          <th>id</th>
          <th>image</th>
          <th>name</th>
          <th>brand</th>
          <th>price</th>
          <th>Updated_At</th>
          <th>Source List</th>
          <th>Index in List</th>
       
        </tr>
      </thead>
      <tbody>
      
        {data.slice(0,500).map((l, i) => (
          // <Card style={{ width: "15rem" }} key={l.id}>
          //   <Card.Img variant="top" src={l.image} />
          //   <Card.Body>
          //     <Card.Title>{l.name}</Card.Title>
          //     <Card.Text>
          //       Brand : {l.brand}
          //       <br />
          //       Price : {l.price.price}
          //       <br />
          //       Date : {l.price.date}
          //       <br />
          //       Statu : {l.statu}
          //       <br />
          //       Index in list : {l.index}
          //     </Card.Text>
              
          //     <Button href={l.url} target="_blank" variant="primary" size="sm">View Product</Button>
          //     <Button href={l.sourceCaregoryUrl} target="_blank" variant="primary" size="sm">Souce list</Button>
          //   </Card.Body>
          // </Card>
          
            <tr key={i}>
              <td>{i+1}</td>
            <td>{l.id}</td>
            <td className="p-0"><Image src={l.image} height={50} onClick={onClickImage}></Image></td>
            <td>{l.name} - <a target="_blank" rel="noreferrer" href={l.url}>click</a></td>
          
            <td>{l.brand}</td>
            <td>{l.price.price}</td>
            <td className="text-nowrap">{l.updated_at}</td>
            <td><a target="_blank" rel="noreferrer" href={l.sourceCaregoryUrl}>click</a></td>
            <td>{l.index}</td>
           
          </tr>
        ))}
      </tbody>
    </Table>
      </Row>
      {/* <Row>
        {data.map((l) => (
          <Card style={{ width: "15rem" }} key={l.id}>
            <Card.Img variant="top" src={l.image} />
            <Card.Body>
              <Card.Title>{l.name}</Card.Title>
              <Card.Text>
                Brand : {l.brand}
                <br />
                Price : {l.price.price}
                <br />
                Date : {l.price.date}
                <br />
                Statu : {l.statu}
                <br />
                Index in list : {l.index}
              </Card.Text>
              
              <Button href={l.url} target="_blank" variant="primary" size="sm">View Product</Button>
              <Button href={l.sourceCaregoryUrl} target="_blank" variant="primary" size="sm">Souce list</Button>
            </Card.Body>
          </Card>
          
        ))}
      </Row> */}
    </div>
  );
}
