import GLU from '/../../glu2.js/src/index';
import DataModel from '/dataSources/DataModel';
import MessageEvents from '/enums/MessageEvents';
import Enum from '/enums/Enum';
import API from '/apis/Api';

class DataController extends GLU.Controller {
    constructor() {
        super();
    }
    onActivate() {
        this.bindGluBusEvents({
            [Enum.MapEvents.RETRIEVE_MAP_INIT]: this.getMapInitSetup,
            [Enum.MapEvents.RETRIEVE_INITIAL_DATA_SETUP]: this.getDataInitSetup,
            [Enum.DataEvents.SAVE_TRAILDATA2MODEL]: this.setTrailData2Model,
            [Enum.DataEvents.RETRIEVE_TRAIL_DATA]: this.getTrailData,
        });
    }

    getMapInitSetup() {
        GLU.bus.emit(MessageEvents.ERROR_MESSAGE, 'Start loading initial data');
        API.Trails.getInitialSetup({
                query: {},
            })
            .then(response => DataModel.parseSetupData(response.text))
            .catch(err => this.getSetupDataError(err));
        GLU.bus.emit(MessageEvents.ERROR_MESSAGE, 'Initial data loaded');
    }

    getDataInitSetup() {
        const dataSetup = {
            countries: DataModel.countries,
            mountains: DataModel.mountains,
            trailTypes: DataModel.trailTypes,
            pointTypes: DataModel.pointTypes,
        };
        GLU.bus.emit(Enum.MapEvents.INITIAL_DATA_SETUP_RETRIEVED, dataSetup);
    }

    onDeactivate() {
        this.unbindGluBusEvents();
    }

    getSetupDataError(err) {
        console.error(err);
        GLU.bus.emit(Enum.Enum.AppEvents.ERROR_OCCURRED, {
            title: 'Error',
            errormessage: err && err.response ? err.response.text : err.toString(),
        });
    }

    setTrailData2Model(payload) {
        DataModel.setDataByName(payload.name, payload.value);
    }

    getTrailData() {
        const trailData = {
            trailName: DataModel.trailName,
            trailDesc: DataModel.trailDesc,
            trailTypeID: DataModel.trailTypeID,
            mountainIDs: DataModel.mountainIDs,
        };
        GLU.bus.emit(Enum.DataEvents.TRAIL_DATA_RETRIEVED, trailData);
    }
}

export default new DataController();