package com.powerledger.suburbia.models;

import com.fasterxml.jackson.annotation.JsonProperty;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.io.Serializable;
import java.util.ArrayList;

@Entity
@Table
public class Postcode implements Serializable {

    @Column(name="postcode", length=4)
    @Id
    private String postcode;

    @Column(name="name", columnDefinition="TEXT")
    private ArrayList<String> name;

    @JsonProperty("postcode")
    public String getPostcode() {
        return postcode;
    }

    public void setPostcode(String postcode) {
        this.postcode = postcode;
    }

    @JsonProperty("name")
    public ArrayList<String> getSuburbNames() {
        return name;
    }

    public void setName(ArrayList<String> name) {
        this.name = name;
    }
}
