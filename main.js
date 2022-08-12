//Posgis kurulumu öncesi yedekleme
// Sayfa açıldığında fonksiyon çalışır
window.onload = init;
// Initial fonksiyon tanımlaması
function init() {
    // Layer oluşturulur ve standard sabit değeri olarak tanımlanır
    const standard = new ol.layer.Tile({
        // Standart map oluşturulur ve kaynak olarak belirlenir
        source: new ol.source.OSM(),
    });
    // Kaynak Vektörü oluşturulur ve kaynak sabit değeri olarak tanımlanır
    const source = new ol.source.Vector();
    // Layer Vektörü oluşturulur ve vektör sabit değeri olarak tanımlanır
    const vector = new ol.layer.Vector({
        source: source,
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2',
            }),
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
            center: [35, 39],
            zoom: 4,
            // center: [0, 0],
            // zoom: 0,
            projection: 'EPSG:4326'
        }),
        target: 'js-map',
    });
    // Geometrik şekillerin yerlerinin değiştirilmesi için modify tanımlanır
    var modify = new ol.interaction.Modify({ source: source });
    // Modify mape interaction olarak eklenir
    map.addInteraction(modify);
    //Geometrik çizim ve çizimi yakalama draw snap özellikleri tanımlanır
    let draw, snap;
    //Geometrik şekil seçimini html ile bağlantı kurulması
    const typeSelect = document.getElementById('type');
    //wkt tanımlama
    var wkt_def = new ol.format.WKT()
    // Parsellerin ekleneceği tabloların tanımlanması
    var table = document.getElementById("table");
    //Pop-up ekran tanımlaması
    var modal_adding = document.getElementById("myModal");
    //Pop-up ekranındaki ekle butonu tanımlanması
    var add_button = document.getElementById("add_button");
    // Pop-up ekranındaki çarpı butonu tanımlanması
    var exit_button = document.getElementById("cross_button");
    //Pop-up ekran2 tanımlaması
    var modal_updating = document.getElementById("myModal2");
    //Update buton tanımlanması
    var update_button = document.getElementById("update_button");
    // Pop-up ekranındaki çarpı2 butonu tanımlanması
    var exit_button2 = document.getElementById("cross_button2");
    //pop-upta girilen il isminin tanımlanması
    var il = document.getElementById("il");
    //pop-upta girilen ilçe isminin tanımlanması
    var ilce = document.getElementById("ilce");
    //tablodaki sütun ayarlaması için table tanımı
    var table = document.getElementById("table");
    var flag = true;

    //DAtabasede olan tüm parsellerin getirilmesi
    console.log("get_features çağrıldı");
    get_features();
    addInteractions();

    //Draw ve Snap fonksiyon içine intereaction olarak eklenir
    function addInteractions() {
        draw = new ol.interaction.Draw({
            source: source,
            type: typeSelect.value,
        });
        map.addInteraction(draw);
        snap = new ol.interaction.Snap({ source: source });
        map.addInteraction(snap);

        modify.on('modifyend', function (evt) {
            var cur_wkt = evt.features.getArray()[0];
            update_data(cur_wkt.id, cur_wkt.il, cur_wkt.ilce, wkt_def.writeFeature(cur_wkt));
            var table = document.getElementById('table');
            for (var r = 0, n = table.rows.length; r < n; r++) {
                for (var c = 0, m = table.rows[r].cells.length; c < m; c++) {
                    if (table.rows[r].cells[c].innerHTML == cur_wkt.id) {
                        table.deleteRow(r);
                        add_data_to_table(cur_wkt.id, cur_wkt.il, cur_wkt.ilce, wkt_def.writeFeature(cur_wkt));
                    }
                }

            }



        });

        draw.on('drawend', function (evt) {
            console.log(evt.feature);
            clear_oldNames();
            current_feature = evt.feature;
            //çizme işlemi bittikten sonra wkt özelliklerinin değişkene atanması
            var wktString = wkt_def.writeFeature(evt.feature);
            //çizme işlmei bittikten sonra pop-up ekranının görülmesi
            modal_adding.style.display = "block";
            //add butonuna basılma durumunda çalışacak fonksiyon
            add_button.onclick = function () {
                var current_il = il.value;
                var current_ilce = ilce.value
                //seçilen parsel bilgilerinin veritabanına kaydedilmesi
                post_data(current_il, current_ilce, wktString);
                //Ekle butonuna basıldıktan sonra pop-up ekranının kapanması
                modal_adding.style.display = "none";
                alert("Ekledin!");
                flag = false;
            }
            //Pop-up ekranındaki çarpıya basılma durumunda çalışacak fonksiyon
            exit_button.onclick = function () {
                //Seçilen parcelin eklenmemesi için feature arrayindeki son eklenen elemanın silinmesi
                source.removeFeature(source.getFeatures()[source.getFeatures().length - 1]);
                //Pop-up ekranının kapanması
                modal_adding.style.display = "none";
            }
        })


    };
    typeSelect.onchange = function () {
        map.removeInteraction(draw);
        map.removeInteraction(snap);
        addInteractions();
    };
    //verilerin tabloya yazılması için sağlanan fonksiyon
    function add_data_to_table(data_id, data_il, data_ilce, data_wkt) {

        var row = table.insertRow(1);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);
        var cell5 = row.insertCell(4);
        var cell6 = row.insertCell(5);

        cell1.innerHTML = data_id;
        cell2.innerHTML = data_il;
        cell3.innerHTML = data_ilce;
        cell4.innerHTML = data_wkt;
        //Delete satır sonlarına eklenmesi butonunun eklenmesi
        var del_btn = document.createElement('input');
        del_btn.type = "button";
        del_btn.value = "Sil";
        cell5.appendChild(del_btn);
        var upp_btn = document.createElement('input');
        upp_btn.type = "button";
        upp_btn.value = "Güncelle";
        cell6.appendChild(upp_btn);


        //Tablodaki Delete butonuna basıldığında çağrılacak fonksiyon
        del_btn.onclick = function () {

            delete_data(data_id, data_il, data_ilce, data_wkt);
            var feature_array = source.getFeatures();
            for (var i in feature_array) {
                if (feature_array[i].id == data_id) {
                    if (flag == false) {
                        source.removeFeature(feature_array[i]);
                        //source.removeFeature(feature_array[i - 1]);
                        delete_row(this);
                    }
                    else {
                        source.removeFeature(feature_array[i]);
                        delete_row(this);
                    }
                }
            }
        }
        upp_btn.onclick = function () {
            var temp_button = this;

            modal_updating.style.display = "block";
            il_update.value = data_il;
            ilce_update.value = data_ilce;
            update_button.onclick = function () {
                var il_guncel = il_update.value;
                var ilce_guncel = ilce_update.value
                //seçilen parsel bilgilerinin veritabanına kaydedilmesi
                update_data(data_id, il_guncel, ilce_guncel, data_wkt);

                //Ekle butonuna basıldıktan sonra pop-up ekranının kapanması
                modal_updating.style.display = "none";
                alert("Güncelledin!");
                delete_row(temp_button);
                //source.addFeature(evt.feature);
                add_data_to_table(data_id, il_guncel, ilce_guncel, data_wkt);
                source.getFeatures()[source.getFeatures().length - 1].il = il_guncel;
                source.getFeatures()[source.getFeatures().length - 1].ilce = ilce_guncel;
            }
            exit_button2.onclick = function () {
                modal_updating.style.display = "none";
            }

        }

    }
    //veritabanından verileri almak için yazılan get ajax fonksiyonu
    function get_features() {
        $.ajax({
            url: 'https://localhost:44381/api/parcel',
            dataType: 'json',
            type: 'get',
            contentType: 'application/json',
            data: { "data": "check" },
            success: function (data) {
                for (var i in data) {
                    var cur_format = new ol.format.WKT();
                    var cur_feature = cur_format.readFeature(data[i].wkt, {
                        dataProjection: 'EPSG:3857',
                        featureProjection: 'EPSG:3857',
                    });
                    cur_feature.id = data[i].id;
                    cur_feature.il = data[i].il;
                    cur_feature.ilce = data[i].ilce;
                    source.addFeature(cur_feature);
                    add_data_to_table(data[i].id, data[i].il, data[i].ilce, data[i].wkt);

                }
            }
        });
    }
    //veritabana verileri yazdırmak için yazılan post ajax fonksiyonu
    function post_data(il, ilce, wkt) {
        debugger;
        $.ajax({
            url: 'https://localhost:44381/api/parcel',
            dataType: 'json',
            type: 'post',
            contentType: 'application/json',
            data: JSON.stringify({ 'il': il, 'ilce': ilce, 'wkt': wkt }),
            success: function (data) {
                console.log(source.getFeatures());
                source.removeFeature(source.getFeatures()[source.getFeatures().length - 1]);

                var cur_format = new ol.format.WKT();
                var cur_feature = cur_format.readFeature(wkt, {
                    dataProjection: 'EPSG:3857',
                    featureProjection: 'EPSG:3857',
                });
                source.addFeature(cur_feature);
                cur_feature.id = data.id;
                cur_feature.il = il;
                cur_feature.ilce = ilce;
                console.log(source.getFeatures());
                add_data_to_table(data.id, il, ilce, wkt);

            },
        });
    }
    //veritabana verileri sildirmek için yazılan delete ajax fonksiyonu
    function delete_data(id, il, ilce, wkt) {
        $.ajax({
            url: 'https://localhost:44381/api/parcel',
            dataType: 'json',
            type: 'delete',
            contentType: 'application/json',
            data: JSON.stringify({ 'id': id, 'il': il, 'ilce': ilce, 'wkt': wkt }),
        });
    }
    function update_data(id, il, ilce, wkt) {
        $.ajax({
            url: 'https://localhost:44381/api/parcel',
            dataType: 'json',
            type: 'put',
            contentType: 'application/json',
            data: JSON.stringify({ 'id': id, 'il': il, 'ilce': ilce, 'wkt': wkt }),
        });
    }
    //Eklenen verinin tabloya basılması için kullanılan fonksiyon
    function dataSave(data) {
        console.log(source.getFeatures());
        // var cur_format = new ol.format.WKT();
        // var cur_feature = cur_format.readFeature(data.wkt, {
        //     dataProjection: 'EPSG:3857',
        //     featureProjection: 'EPSG:3857',
        // });
        // source.addFeature(cur_feature);
        // cur_feature.id = data.id;
        // cur_feature.il = data.il;
        // cur_feature.ilce = data.ilce;
        // debugger;
        // console.log(source.getFeatures());
        add_data_to_table(data.id, data.il, data.ilce, data.wkt);
    }
    function clear_oldNames() {
        document.getElementById('il').value = " ";
        document.getElementById('ilce').value = " ";
    }
    function delete_row(row) {
        //no clue what to put here?
        var r = row.parentNode.parentNode;
        r.parentNode.removeChild(r);
    }
}


