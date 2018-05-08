import React, { Component } from 'react';
import './App.css';
import Navigation from './components/navigation/navigation';
import Logo from './components/logo/logo';
import ImageLinkForm from './components/imagelinkform/imagelinkform';
import Signin from './components/signin/signin';
import Register from './components/register/register';
import Rank from './components/rank/rank';
import Particles from 'react-particles-js';

import FaceRecognition from './components/facerecognition/facerecognition';



const particlesOptions = {
  particles: {
    number: {
      value:37,
      density: {
        enable: true,
        value_area: 247
      } 
    }    
  }
}

const initialState = {
     input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        email: '',
        name: '',
        id: '',
        entries: 0,
        joined: ''

      }
}

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

loadUser = (data) => {
  this.setState({user: {
        email: data.email,
        name:data.name,
        id: data.id,
        entries: data.entries,
        joined: data.joined    
  }})
}

calculateFaceLocation = (API_data) => {
  const clarifaiFace = API_data.outputs[0].data.regions[0].region_info.bounding_box
  const image = document.getElementById('inputimage');
  const width = Number(image.width);
  const height = Number(image.height);
  return {
    leftCol: clarifaiFace.left_col * width,
    topRow: clarifaiFace.top_row * height,
    rightCol: width - (clarifaiFace.right_col * width),
    bottomRow: height - (clarifaiFace.bottom_row * height)
  }
}

displayFaceBox = (box) => {
  console.log(box);
  this.setState({box:box});
}

 onInputChange = (event) => {
    this.setState({input:event.target.value})
  
 }

onButtonSubmit = () => {
  this.setState({imageUrl:this.state.input});
    fetch(' https://shielded-castle-53107.herokuapp.com/imageurl', {
          method: 'post',
    headers: {'Content-type': 'application/json'},
    body: JSON.stringify({
      input: this.state.input
    })
        })
    .then(response => response.json())
    .then(response => {
      if(response) {
        fetch(' https://shielded-castle-53107.herokuapp.com/image', {
          method: 'put',
    headers: {'Content-type': 'application/json'},
    body: JSON.stringify({
      id: this.state.user.id,
    })
        })
        .then(response => response.json())
        .then(count => {
          this.setState(Object.assign(this.state.user, {entries:count}))
        })
       
      }
      this.displayFaceBox(this.calculateFaceLocation(response))
  })
    .catch(err => console.log(err));
  }

  onRouteChange=(route)=> {
    if (route ==='signout') {
      this.setState(initialState)
    } else if (route==='home') {
      this.setState({isSignedIn:true})
    } 
    this.setState({route:route})
  }

  render() {

    return (
      <div className="App">
        <Particles className='particles' 
      params={particlesOptions}
      />        
       <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange} />
       { this.state.route==='home'
        ?<div> 
           <Logo />
           <Rank name={this.state.user.name} entries={this.state.user.entries} />
           <ImageLinkForm 
           onInputChange={this.onInputChange}
           onButtonSubmit={this.onButtonSubmit}/>
           <FaceRecognition 
           box={this.state.box}
           imageUrl={this.state.imageUrl}/>
        </div>
        :(
           this.state.route==='signin'
          ?<Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
          :<Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
          )
        }
      </div>
    );
  }
}

export default App;
