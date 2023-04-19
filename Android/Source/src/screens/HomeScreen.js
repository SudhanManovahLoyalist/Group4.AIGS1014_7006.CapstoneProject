import React, {useLayoutEffect,useState,useEffect,useCallback, useMemo, useRef} from 'react';
import {ScrollView, StyleSheet, Text,ActivityIndicator,TouchableOpacity,View,Image,Dimensions} from 'react-native';
import {connect, useSelector} from 'react-redux';
import { AppStyles} from '../AppStyles';
import {Configuration} from '../Configuration';
import { WebView} from 'react-native-webview';
import { Button } from '@rneui/base';
import Icon from "react-native-vector-icons/dist/MaterialCommunityIcons";
import firestore from '@react-native-firebase/firestore';
import uuid from 'react-native-uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import StopwatchTimer from 'react-native-animated-stopwatch-timer';
import { LineChart} from "react-native-chart-kit";
import DropDownPicker from 'react-native-dropdown-picker';


currentsession = "";
user = ""
currentdate = ""
async function retrieveuser () {
  user = await AsyncStorage.getItem('@loggedInUserID:key')
}

function HomeScreen({navigation}) {
  const auth = useSelector((state) => state.auth);

  const [isLoading, setIsLoading] = useState(false);

  const [ischartdataready, setchartready] = useState(false);

  const [elapsedtime, setelapsedtime] = useState("0h 0m 0s");

  const [Chartdata, setchartdata] = useState(Array(7).fill(0).map(row => new Array(0)));

  const [Chartdatareplica, setchartdatareplica] = useState(Array(7).fill(0).map(row => new Array(0)));

  const [ChartLabeldata, setChartLabeldata] = useState(new Array(0));

  const [ChartLegend, setChartLegend] = useState(['Angry', 'Disgust','fearful','Happy','Sad','Surprise']);

  const [count, setCount] = useState(0);

  const [currentsecond, setcurrentsecond] = useState(0);

  

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([
    {label: 'Angry', value: 0},
    {label: 'Disgusted', value: 1},
    {label: 'fearful', value: 2},
    {label: 'Happy', value: 3},
    {label: 'Sad', value: 4},
    {label: 'Surprised', value: 5},
    {label: 'Neutral', value: 6},
     ]);

  // Function to increment count by 1
const incrementCount = () => {
  // Update state with incremented value
  setCount(count + 1);
};

//const Sessionsref = collection(db, "Sessions");
useEffect(() => {

  if(!ischartdataready)
  {
  firestore()
  .collection('Sessions')
  // Filter results
  .where('Guid', '==', currentsession)
  // Limit results
  .limit(200)
  .orderBy('time',"asc")
  .get()
  .then(querySnapshot => {
 
    
    var i = Math.round(querySnapshot.size / 11);
    querySnapshot.forEach((documentSnapshot,index) => {
      if (index % i === 0)
      {
       ChartLabeldata.push(getmeseconds(documentSnapshot.data().time))
      Chartdata[0].push(documentSnapshot.data().angry)
      Chartdata[1].push(documentSnapshot.data().disgusted)
      Chartdata[2].push(documentSnapshot.data().fearful)
      Chartdata[3].push(documentSnapshot.data().happy)
      Chartdata[4].push(documentSnapshot.data().sad)
      Chartdata[5].push(documentSnapshot.data().surprised)
      Chartdata[6].push(documentSnapshot.data().neutral)
    }
  });

  if (ChartLabeldata.length) {
    setChartLabeldata(ChartLabeldata);
  }
  if (Chartdata[0].length) {
    setchartdata(Chartdata);
    setchartdatareplica(Chartdata)
  }
    setchartready(true)
    

  });}
}, [ischartdataready]);

async function dataretriever ()  {
  setchartready(false)

  setChartLabeldata(new Array(0))

  setchartdata(Array(7).fill(0).map(row => new Array(0)))

  setchartdatareplica(Array(7).fill(0).map(row => new Array(0)))

  setChartLegend(['Angry', 'Disgust','fearful','Happy','Sad','Surprise'])
  
}

  const data={
    labels: ChartLabeldata,
    datasets: [
                        
                {
                            data: Chartdata[0],
                            strokeWidth: 2,
                            color: (opacity = 1) => `rgba(255, 99, 71, ${opacity})`
                },
                {
                            data: Chartdata[1],
                            strokeWidth: 2,
                            color: (opacity = 1) => `rgba(127, 255, 212, ${opacity})`
                },
                {
                            data: Chartdata[2],
                            strokeWidth: 2,
                            color: (opacity = 1) => `rgba(255, 215, 0, ${opacity})`
                },  
                {
                            data: Chartdata[3],
                            strokeWidth: 2,
                            color: (opacity = 1) => `rgba(0, 255, 127, ${opacity})`
                },  
                {
                            data: Chartdata[4],
                            strokeWidth: 2,
                            color: (opacity = 1) => `rgba(30, 144, 255, ${opacity})`
                },  
                {
                            data: Chartdata[5],
                            strokeWidth: 2,
                            color: (opacity = 1) => `rgba(255, 105, 180, ${opacity})`
                },  
                {
                            data: Chartdata[6],
                            strokeWidth: 2,
                            color: (opacity = 1) => `rgba(147, 112, 219, ${opacity})`
                },
            ],
    legend: ChartLegend,
    }

  const chartconfig={
    backgroundColor: '#1cc910',
    backgroundGradientFrom: '#eff3ff',
    backgroundGradientTo: '#efefef',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
        borderRadius: 16,
    },
}
  const convertMillisecondsToHoursMinutesSeconds = (milliseconds) => {
    if(milliseconds !== undefined)
    {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    const seconds = Math.floor(((milliseconds % 360000) % 60000) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
    }else{
      return elapsedtime
    }
  };

  const getmeseconds = (milliseconds) => {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    const seconds = Math.floor(((milliseconds % 360000) % 60000) / 1000);
    return minutes == 0 ? `${seconds}s` : `${minutes}m:${seconds}s`;
  };

  useEffect(() => {

    retrieveuser();
  }, []);

  useEffect(() => {

    
  }, [Chartdata]);

  useEffect(() => {
    if(isLoading){
      currentsession = uuid.v4();
      play()
      setValue()
      }
      else if(count != 0 && !isLoading)
      {
        reset()
        handlePresentModalPress()
        dataretriever()
      }
      incrementCount()
      this.webref.injectJavaScript('newrecordingstarted = '+isLoading);
  }, [isLoading]);
  // This function will be triggered when the button is pressed
  const toggleLoading = () => {
  setIsLoading(!isLoading);
  setelapsedtime(convertMillisecondsToHoursMinutesSeconds(stopwatchRef.current?.getSnapshot()))

};

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Home',
    });
  }, []);

  const Handler = (data) => {
    var time = stopwatchRef.current?.getSnapshot()
    if(currentsecond +1000 < time && isLoading)
    {
    setcurrentsecond(time) 
    parsed = JSON.parse(data.nativeEvent.data)
    firestore()
    .collection('Sessions')
    .add({
      Datetime: moment().format('YYYY-MM-DD HH:mm:ss'),
      Guid: currentsession,
      angry : parsed.angry.toFixed(2) == 0.00 ? 0 : parsed.angry.toFixed(2),
      disgusted : parsed.disgusted.toFixed(2) == 0.00 ? 0 : parsed.disgusted.toFixed(2),
      fearful: parsed.fearful.toFixed(2) == 0.00 ? 0 : parsed.fearful.toFixed(2),
      happy: parsed.happy.toFixed(2) == 0.00 ? 0 : parsed.happy.toFixed(2),
      neutral: parsed.neutral.toFixed(2) == 0.00 ? 0 : parsed.neutral.toFixed(2),
      sad: parsed.sad.toFixed(2) == 0.00 ? 0 : parsed.sad.toFixed(2),
      surprised: parsed.surprised.toFixed(2) == 0.00 ? 0 : parsed.surprised.toFixed(2),
      user :  user,
      time : stopwatchRef.current?.getSnapshot()
    })
    .then(() => {
        console.log('RECORD added!');
    }).catch((error)=>{
      console.log(error);
    });
  }
  }

 
  var bottomSheetModalRef = useRef(null);
  // variables
  var snapPoints = useMemo(function () { return ['1%','51%', '96%']; }, []);
  // callbacks
  var handlePresentModalPress = useCallback(function () {
      var _a;

       (_a = bottomSheetModalRef.current) === null || _a === void 0 ? void 0 : _a.present();
      _a.expand();

  }, []);
  var handleSheetChanges = useCallback(function (index) {
  }, []);

  const stopwatchRef = React.useRef(null);

  // Methods to control the stopwatch
   play = () => {
    stopwatchRef.current?.play();
  }

   pause= () => {
    stopwatchRef.current?.pause();
  }

   reset= () => {
    stopwatchRef.current?.reset();
  }

  onChangeValue=(value) => {

    var chartLabeldata = []
    var chartdata = Array(7).fill(0).map(row => new Array(0))
    switch(value) {
      case 0:
        chartdata[0]= Chartdatareplica[0]
        chartLabeldata.push('Angry')
        break;
      case 1:
        chartdata[1]= Chartdatareplica[1]
        chartLabeldata.push('Disgusted')
        // code block
        break;
      case 2:
        chartdata[2]= Chartdatareplica[2]
        chartLabeldata.push('fearful')
        // code block
        break;
      case 3:
        chartdata[3]= Chartdatareplica[3]
        chartLabeldata.push('Happy')
        // code block
        break;
      case 4:
        chartdata[4]= Chartdatareplica[4]
        chartLabeldata.push('Sad')
        // code block
        break;
      case 5:
        chartdata[5]= Chartdatareplica[5]
        chartLabeldata.push('Surprised')
        // code block
        break;
      case 6:
        chartdata[6]= Chartdatareplica[6]
        chartLabeldata.push('Neutral')
        // code block
        break;
    }
      setchartdata(chartdata)
      setChartLegend(chartLabeldata)
    

  }
  var gamename = "Asphalt Legends : 9"
  return (
    <ScrollView style={styles.container}> 
      <Text style={styles.title}>Welcome {auth.user?.fullname ?? 'User'}</Text>
      <WebView 
    ref={(r) => (this.webref = r)}
    onLoadStart={()=>{console.log("Start")}} 
    //onLoadEnd={()=>setShouldShow(false)} 
    userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36" 
    source={{ uri: 'file:///android_asset/www/index.html' }} 
    originWhitelist={['*']} 
    allowsInlineMediaPlayback 
    javaScriptEnabled 
    allowInlineMediaPlayback={true} 
    mediaPlaybackRequiresUserAction={false} 
    startInLoadingState 
    onNavigationStateChange={(val)=>{  }} 
    javaScriptEnabledAndroid 
    geolocationEnabled={true} 
    useWebkit
    onMessage={Handler}
    style = {{
      width: 480,
      height:640
    }} />
    <View style={[{flexDirection:'row', alignItems:'center'}]}>
  <View style={{paddingLeft:67,paddingRight:0}}>
  <Button
      buttonStyle={{ backgroundColor: 'black',
      borderWidth: 2,
      borderColor: 'white',
      borderRadius: 30,}}
      containerStyle={{  width: 150,
       marginHorizontal:43}}
      disabledStyle={{
        borderWidth: 2,
        borderColor: "#00F"
      }}
      disabledTitleStyle={{ color: "#00F" }}
      linearGradientProps={null}
      icon={isLoading ? <ActivityIndicator size="small" color="grey" /> : <Icon name="react" size={15} color="#0FF" />}
      iconContainerStyle={{ background: "#000" }}
      loadingProps={{ animating: true }}
      loadingStyle={{}}
      onPress={toggleLoading}
      title={isLoading ? "Stop Analyzer" : "Start Analyzer"}
      titleProps={{}}
      titleStyle={{ marginHorizontal: 5 }}
    />
    </View> 
    
    {isLoading && <StopwatchTimer ref={stopwatchRef} 
                      containerStyle={styles.stopWatchContainer}       
                      textCharStyle={styles.stopWatchChar}
                      trailingZeros={2}/>}
    </View>
    <BottomSheetModalProvider>
      <View style={styles.container}>
        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={1}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
        >
          <View style={styles.contentContainer}>
           <View style={[{flexDirection:'row', alignItems:'center'}]}>
              <View style={[{flex:1,flexDirection:'row'}]}>
                <Text style={{fontFamily: 'Cochin',fontSize:25,fontWeight:'bold',color:'grey'}}>{gamename}</Text>
              </View>
              <View style={[{justifyContent:'space-evenly', marginVertical:10}]}>
                <Image
                        style={styles.tinyLogo}
                        source= {require('./images/game.png')}
                       
                      />
            </View>
          </View>
     
           <View style= {{padding :10}}><Text style={{fontFamily:'Cochin',fontSize:15,color:'grey'}}>Session Duration : <Text style={{color:'green'}}>{elapsedtime}</Text></Text></View>
           <View style= {{padding :10}}><Text style={{fontFamily:'Cochin',fontSize:15,color:'grey'}}>Levels Played : Chapter 1: Welcome To Asphalt </Text></View>
           <View style= {{padding :10,paddingLeft:50}}><Text style={{fontFamily:'Cochin',fontSize:15,color:'grey'}}>Sub Level : Camaro 2018 </Text></View>
           <View style= {{padding :10,paddingLeft:50}}><Text style={{fontFamily:'Cochin',fontSize:15,color:'grey'}}>Sub Level : Gearheads </Text></View>
           {/* <View style= {{padding :10,paddingLeft:50}}><Text style={{fontFamily:'Cochin',fontSize:15}}>Sub Level : Camaro </Text></View>
           <View style= {{padding :10,paddingLeft:50}}><Text style={{fontFamily:'Cochin',fontSize:15}}>Sub Level : Pure Muscle Car </Text></View>
            */}
            <View style= {{width:130,marginLeft:250,height:50}}>
            <DropDownPicker
            open={open}
            value={value}
            items={items}
            setOpen={setOpen}
            setValue={setValue}
            onChangeValue = {onChangeValue}
            setItems={setItems}
            dropDownDirection="TOP"
            placeholder="choose"
            listMode="SCROLLVIEW"

          /></View>
           {ischartdataready &&
           <View><LineChart
              bezier
              formatXLabel={value =>
                data.labels.length > 2
                  ? data.labels[1] == value ||
                    data.labels[data.labels.length - 2] == value ||
                    data.labels[data.labels.length / 2] == value ||
                    data.labels[data.labels.length / 3] == value ||
                    data.labels[data.labels.length / 2 + 0.5] == value
                    ? value
                    : ""
                  : value
              }
              withHorizontalLabels={true}
              withVerticalLabels={true}
              data={data}
              width={Dimensions.get('window').width - 25}
              height={230}
              chartConfig={chartconfig}
              style={{borderRadius: 16}}/></View>}

          </View>
        </BottomSheetModal>
      </View>
    </BottomSheetModalProvider>

   </ScrollView>
  );
}



const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    padding: Configuration.home.listing_item.offset
      },
  title: {
    fontWeight: 'bold',
    color: AppStyles.color.title,
    fontSize: 25,
    marginBottom:2
  },
  userPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 5,
  },button: {
    backgroundColor: 'black',
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 30,
    width: 150,
    height:40,
    marginHorizontal: 110,
    marginVertical:3
  },
  buttonText: {
    marginLeft:16,
    marginTop:6
  },loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center'
  },tinyLogo: {
    width: 150,
    height: 150,
    resizeMode: 'stretch',
  },
  stopWatchChar: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
    color: 'grey',
  },
});

const mapStateToProps = (state) => ({
  user: state.auth.user,
});

export default connect(mapStateToProps)(HomeScreen);
