// Sayfa açıldığında fonksiyon çalışır
window.onload = init;
// Main fonksiyon tanımlaması
function init() {
    // Standart map layer olarak seçilir
    const standard = new ol.layer.Tile({
        source: new ol.source.OSM(),
    });
    //wkt tanımlama
    var wktt = new ol.format.WKT()

    // Parsellerin ekleneceği tabloların tanımlanması
    var table;
    table = document.getElementById("table");
    // Vektör kaynağı tanımlanır
    const source = new ol.source.Vector();
    // Vektör değişkeni tanımlanır
    const vector = new ol.layer.Vector({
        source: source,
        style: new ol.style.Style({
            // fill: new ol.style.Fill({
            //     color: 'rgba(255, 255, 255, 0.2',
            // }),
            stroke: new ol.style.Stroke({
                color: '#ffcc33',
                width: 2,
            }),
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: '#ffcc33',
                }),
            }),
        }),
    });
    // Map tanımlanır
    const map = new ol.Map({
        layers: [standard, vector],
        view: new ol.View({
            center: [0, 0],
            zoom: 2,
            projection: 'EPSG:4326'
        }),
        target: 'js-map',
    });
    // Geometrik şekillerin yerlerinin değiştirilmesi için modify tanımlanır
    const modify = new ol.interaction.Modify({ source: source });
    // Modify mape interaction olarak eklenir
    map.addInteraction(modify);
    //Geometrik çizim ve çizimi yakalama draw snap özellikleri tanımlanır
    let draw, snap;
    //Geometrik şekil seçimini html ile bağlantı kurulması
    const typeSelect = document.getElementById('type');
    get_features();
    //Draw ve Snap fonksiyon içine intereaction olarak eklenir
    function addInteractions() {
        draw = new ol.interaction.Draw({
            source: source,
            type: typeSelect.value,
        });
        map.addInteraction(draw);
        snap = new ol.interaction.Snap({ source: source });
        map.addInteraction(snap);
        draw.on('drawend', function (evt) {
            console.log(evt.feature);
            var wktString = wkt.writeFeature(evt.feature);
            var modal = document.getElementById("myModal");
            modal.style.display = "block";
            var button = document.getElementById("add_button");
            button.onclick = function () {
                // var sehir = document.getElementById("sehir");
                // var ilce = document.getElementById("ilce");
                // var table = document.getElementById("table");
                // var row = table.insertRow(1);
                // var cell1 = row.insertCell(0);
                // var cell2 = row.insertCell(1);
                // var cell3 = row.insertCell(2);
                // cell1.innerHTML = "1";
                // cell2.innerHTML = sehir.value;
                // cell3.innerHTML = ilce.value;
                modal.style.display = "none";
            }
        })
    };
    //Tıklamaya göre draw ve snapin kaldırılması
    typeSelect.onchange = function () {
        map.removeInteraction(draw);
        map.removeInteraction(snap);
        addInteractions();
    };
    addInteractions();

    function add_data_to_table(id, il, ilce, wkt) {
        var row = table.insertRow(1);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        const parsel = wktt.readFeature(wkt, {
            dataProjection: 'EPSG:3857',
            featureProjection: 'EPSG:3857',
        });
        source.addFeature(parsel);
        cell1.innerHTML = id;
        cell2.innerHTML = il;
        cell3.innerHTML = ilce;
    }

    function get_features() {

        $.ajax({
            url: 'https://localhost:44381/api/parcel',
            dataType: 'json',
            type: 'get',
            contentType: 'application/json',
            data: { "data": "check" },
            success: function (data) {
                for (var i in data) {
                    add_data_to_table(data[i].id, data[i].il, data[i].ilce, data[i].wkt);
                }
            }
        });
    }
}


// function get() {
//     $.ajax({
//         url: 'https://localhost:44382/api/location',
//         dataType: 'json',
//         type: 'get',
//         contentType: 'application/json',
//         data: { "data": "check" },
//         success: function (data) {
//             for (var i in data) {
//                 insert_function_ontable(data[i].id, data[i].wkt, data[i].sehir, data[i].ilce);
//             }
//         }
//     });
// }